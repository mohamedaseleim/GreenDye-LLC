const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Doc = require('../models/DocumentVersion');
const { audit } = require('../utils/audit');
const { scanBuffer } = require('../utils/malwareScanner');
const { hasRole } = require('../utils/roles');
const { validateOpenXml } = require('../utils/openXmlSecurity');
const base = path.join(__dirname, '../private_uploads');
fs.mkdirSync(base, { recursive: true, mode: 0o700 });

const signatures = {
  'application/pdf': b => b.subarray(0, 5).toString() === '%PDF-',
  'image/png': b => b.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])),
  'image/jpeg': b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': b => b[0] === 0x50 && b[1] === 0x4b,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': b => b[0] === 0x50 && b[1] === 0x4b
};

const safeName = name => String(name || 'document').replace(/[\r\n"\\/<>:*?|]+/g, '_').slice(0, 180);

exports.upload = async (req, res, next) => {
  let filePath;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File required' });
    const projectQuota=Number(process.env.PROJECT_STORAGE_QUOTA_BYTES)||1073741824;
    const dailyQuota=Number(process.env.USER_DAILY_UPLOAD_BYTES)||262144000;
    const dayStart=new Date();dayStart.setUTCHours(0,0,0,0);
    const [projectUsage,dailyUsage]=await Promise.all([
      Doc.aggregate([{$match:{project:req.project._id,status:{$ne:'deleted'}}},{$group:{_id:null,total:{$sum:'$size'}}}]),
      Doc.aggregate([{$match:{uploadedBy:req.user._id,createdAt:{$gte:dayStart},status:{$ne:'deleted'}}},{$group:{_id:null,total:{$sum:'$size'}}}])
    ]);
    if((projectUsage[0]?.total||0)+req.file.size>projectQuota)return res.status(413).json({success:false,message:'Project storage quota exceeded'});
    if((dailyUsage[0]?.total||0)+req.file.size>dailyQuota)return res.status(429).json({success:false,message:'Daily upload quota exceeded'});
    if (!signatures[req.file.mimetype]?.(req.file.buffer) || (false)) return res.status(415).json({ success: false, message: 'File content does not match its declared type' });
    await validateOpenXml(req.file.buffer,req.file.mimetype);
    await scanBuffer(req.file.buffer);
    const classification = req.body.classification || 'standard';
    if (!['standard','confidential','highly_confidential'].includes(classification)) return res.status(400).json({ success: false, message: 'Invalid classification' });
    const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const title = String(req.body.title || req.file.originalname).trim().slice(0, 200);
    const last = await Doc.findOne({ project: req.project._id, title }).sort({ version: -1 });
    const version = (last?.version || 0) + 1;
    const key = `${req.project._id}-${crypto.randomUUID()}`;
    filePath = path.join(base, key);
    fs.writeFileSync(filePath, req.file.buffer, { mode: 0o600, flag: 'wx' });
    const data = await Doc.create({ project:req.project._id,title,version,category:req.body.category,classification,storageKey:key,originalName:safeName(req.file.originalname),mimeType:req.file.mimetype,size:req.file.size,sha256:hash,uploadedBy:req.user._id,notes:req.body.notes });
    await audit(req, 'document.upload', 'DocumentVersion', data._id, null, { project: data.project, title: data.title, version: data.version, sha256: data.sha256 });
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    next(error);
  }
};

exports.download = async (req, res, next) => {
  try {
    const data = await Doc.findOne({ _id:req.params.documentId, project:req.project._id, status:{ $ne:'deleted' } }).select('+storageKey');
    if (!data) return res.status(404).json({ success:false, message:'Document not found' });
    const privileged = hasRole(req.user,'admin','super_admin') || String(req.project.projectManager) === String(req.user._id);
    if (data.classification !== 'standard' && !privileged && !req.projectMember?.permissions?.viewConfidentialFiles) return res.status(403).json({ success:false, message:'Confidential document permission required' });
    const filePath = path.join(base, data.storageKey);
    if (!fs.existsSync(filePath)) return res.status(410).json({ success:false, message:'Stored document is unavailable' });
    res.setHeader('Cache-Control','private, no-store, max-age=0');
    res.setHeader('Pragma','no-cache');
    res.type(data.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeName(data.originalName))}`);
    await audit(req, 'document.download', 'DocumentVersion', data._id, null, { project:data.project, version:data.version });
    res.sendFile(filePath);
  } catch (error) { next(error); }
};

exports.list=async(req,res,next)=>{try{const privileged=hasRole(req.user,'admin','super_admin')||String(req.project.projectManager)===String(req.user._id)||req.projectMember?.permissions?.viewConfidentialFiles;const query={project:req.project._id,status:req.query.status||'active',...(privileged?{}:{classification:'standard'})};const data=await Doc.find(query).select('-storageKey').populate('uploadedBy','name email').sort({title:1,version:-1});res.json({success:true,count:data.length,data})}catch(e){next(e)}};
exports.archive=async(req,res,next)=>{try{const data=await Doc.findOneAndUpdate({_id:req.params.documentId,project:req.project._id,status:'active'},{status:'archived',archivedAt:new Date(),archivedBy:req.user._id},{new:true});if(!data)return res.status(404).json({success:false,message:'Active document not found'});await audit(req,'document.archive','DocumentVersion',data._id,null,{status:data.status});res.json({success:true,data})}catch(e){next(e)}};
exports.restore=async(req,res,next)=>{try{const data=await Doc.findOneAndUpdate({_id:req.params.documentId,project:req.project._id,status:'archived'},{status:'active',$unset:{archivedAt:1,archivedBy:1}},{new:true});if(!data)return res.status(404).json({success:false,message:'Archived document not found'});await audit(req,'document.restore','DocumentVersion',data._id,null,{status:data.status});res.json({success:true,data})}catch(e){next(e)}};
exports.reclassify=async(req,res,next)=>{try{if(!['standard','confidential','highly_confidential'].includes(req.body.classification))return res.status(400).json({success:false,message:'Invalid classification'});const data=await Doc.findOneAndUpdate({_id:req.params.documentId,project:req.project._id,status:{$ne:'deleted'}},{classification:req.body.classification},{new:true,runValidators:true});if(!data)return res.status(404).json({success:false,message:'Document not found'});await audit(req,'document.reclassify','DocumentVersion',data._id,null,{classification:data.classification});res.json({success:true,data})}catch(e){next(e)}};
exports.remove=async(req,res,next)=>{try{const data=await Doc.findOne({_id:req.params.documentId,project:req.project._id,status:{$ne:'deleted'}}).select('+storageKey');if(!data)return res.status(404).json({success:false,message:'Document not found'});data.status='deleted';data.deletedAt=new Date();data.deletedBy=req.user._id;await data.save();const filePath=path.join(base,data.storageKey);if(fs.existsSync(filePath))fs.unlinkSync(filePath);await audit(req,'document.delete','DocumentVersion',data._id,null,{status:data.status});res.json({success:true})}catch(e){next(e)}};
