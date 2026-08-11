const Certificate=require('../models/Certificate');
const pick=require('../utils/pick');
const {audit}=require('../utils/audit');
const User=require('../models/User');
const mongoose=require('mongoose');
const {DEFAULT_CERTIFICATE_ISSUER}=require('../utils/constants');
const escapeRegex=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const editable=['user','recipientName','credentialTitle','credentialReference','certificateType','certificateLevel','grade','score','completionDate','issueDate','expiryDate','assessorName','metadata'];
const withTransaction=async work=>{const session=await mongoose.startSession();try{return await session.withTransaction(()=>work(session))}finally{await session.endSession()}};
const metadataFrom=(body,user)=>({...(body.metadata||{}),duration:body.duration??body.metadata?.duration,scheme:body.scheme??body.metadata?.scheme,heldOn:body.heldOn??body.metadata?.heldOn,heldIn:body.heldIn??body.metadata?.heldIn,issuedBy:DEFAULT_CERTIFICATE_ISSUER,issuerUser:user._id,issuerName:user.name});
exports.getAllCertificates = async (req, res, next) => {
  try {
    const page=Math.max(Number.parseInt(req.query.page,10)||1,1),limit=Math.min(Math.max(Number.parseInt(req.query.limit,10)||20,1),100),skip=(page-1)*limit;
    const query=req.query.status?{status:req.query.status}:{status:{$ne:'deleted'}};
    if(req.query.isRevoked!==undefined)query.isRevoked=req.query.isRevoked==='true';
    if(req.query.certificateType)query.certificateType=req.query.certificateType;
    if(req.query.search){const pattern=new RegExp(escapeRegex(req.query.search.trim()),'i');query.$or=[{certificateId:pattern},{credentialReference:pattern},{credentialTitle:pattern},{recipientName:pattern}]}
    const [data,total]=await Promise.all([Certificate.find(query).sort({issueDate:-1,_id:-1}).skip(skip).limit(limit),Certificate.countDocuments(query)]);
    res.json({success:true,count:data.length,total,page,limit,data});
  } catch (error) { next(error); }
};
exports.createCertificate=async(req,res,next)=>{try{let data;await withTransaction(async session=>{const payload=pick(req.body,editable);payload.status='active';payload.metadata=metadataFrom(req.body,req.user);[data]=await Certificate.create([payload],{session});await audit(req,'credential.create','Certificate',data._id,null,data.toObject(),{session})});res.status(201).json({success:true,data})}catch(error){next(error)}};
exports.updateCertificate=async(req,res,next)=>{try{let data;await withTransaction(async session=>{data=await Certificate.findById(req.params.id).session(session);if(!data||data.status==='deleted')return;const before=data.toObject();data.set(pick(req.body,editable));const currentMetadata=data.metadata?.toObject?.()||{};data.metadata=metadataFrom({metadata:{...currentMetadata,...(req.body.metadata||{})},duration:req.body.duration,scheme:req.body.scheme,heldOn:req.body.heldOn,heldIn:req.body.heldIn,issuedBy:req.body.issuedBy},req.user);await data.save({session});await audit(req,'credential.update','Certificate',data._id,before,data.toObject(),{session})});if(!data)return res.status(404).json({success:false,message:'Credential not found'});res.json({success:true,data})}catch(error){next(error)}};
exports.regenerateCertificate=async(req,res,next)=>{try{let data;await withTransaction(async session=>{data=await Certificate.findOne({_id:req.params.id,status:{$nin:['deleted','archived']}}).session(session);if(!data)return;const before=data.toObject();data.verificationUrl='';data.qrCode=undefined;await data.save({session});await audit(req,'credential.regenerate','Certificate',data._id,before,{verificationUrl:data.verificationUrl},{session})});if(!data)return res.status(404).json({success:false,message:'Credential not found'});res.json({success:true,data})}catch(error){next(error)}};
exports.bulkUploadCertificates = async (req, res, next) => {
  const session=await mongoose.startSession();
  try {
    const source=Array.isArray(req.body.certificates)?req.body.certificates.slice(0,500):[];
    if(!source.length)return res.status(400).json({success:false,message:'At least one credential is required'});
    const emails=[...new Set(source.map(item=>String(item.recipientEmail||'').trim().toLowerCase()).filter(Boolean))];
    const users=await User.find({email:{$in:emails}}).select('_id email').lean();
    const userByEmail=new Map(users.map(user=>[user.email,user._id]));
    const references=source.map(item=>String(item.credentialReference||'').trim().toUpperCase()).filter(Boolean);
    const existing=await Certificate.find({credentialReference:{$in:references}}).select('credentialReference').lean();
    const used=new Set(existing.map(item=>item.credentialReference));
    const accepted=[],failed=[];
    for(let index=0;index<source.length;index+=1){
      const item=source[index],row=index+2,email=String(item.recipientEmail||'').trim().toLowerCase();
      const payload=pick(item,editable);payload.credentialReference=String(payload.credentialReference||'').trim().toUpperCase();
      if(email&&userByEmail.has(email))payload.user=userByEmail.get(email);
      if(!payload.recipientName&&email)payload.recipientName=email;
      payload.status='active';payload.metadata={...metadataFrom(item,req.user),recipientEmail:email||undefined};
      if(!payload.recipientName&&!payload.user)failed.push({row,credentialReference:payload.credentialReference,reason:'recipientEmail, recipientName, or user is required'});
      else if(!payload.credentialTitle)failed.push({row,credentialReference:payload.credentialReference,reason:'credentialTitle is required'});
      else if(!payload.credentialReference)failed.push({row,reason:'credentialReference is required'});
      else if(used.has(payload.credentialReference))failed.push({row,credentialReference:payload.credentialReference,reason:'Duplicate credential reference'});
      else{used.add(payload.credentialReference);accepted.push({row,payload})}
    }
    const inserted=[];
    await session.withTransaction(async()=>{
      if(accepted.length){const docs=await Certificate.create(accepted.map(item=>item.payload),{session,ordered:true});docs.forEach((doc,index)=>inserted.push({row:accepted[index].row,id:doc._id,certificateId:doc.certificateId,credentialReference:doc.credentialReference}))}
      await audit(req,'credential.bulk_create','Certificate',null,null,{inserted:inserted.length,failed:failed.length},{session});
    });
    res.status(inserted.length?201:422).json({success:inserted.length>0,data:{inserted,failed},counts:{inserted:inserted.length,failed:failed.length}});
  } catch (error) { if(error.code===11000)return res.status(409).json({success:false,message:'A credential reference was created concurrently; retry the rejected row',data:{inserted:[],failed:[{credentialReference:error.keyValue?.credentialReference,reason:'Duplicate credential reference'}]},counts:{inserted:0,failed:1}});next(error); }
  finally { await session.endSession(); }
};
exports.revokeCertificate=async(req,res,next)=>{try{const reason=String(req.body.reason||'').trim();if(!reason)return res.status(400).json({success:false,message:'Revocation reason is required'});let data;await withTransaction(async session=>{data=await Certificate.findOne({_id:req.params.id,status:'active'}).session(session);if(!data)return;const before=data.toObject();data.status='revoked';data.revokedDate=new Date();data.revokedReason=reason;await data.save({session});await audit(req,'credential.revoke','Certificate',data._id,before,data.toObject(),{session})});if(!data)return res.status(409).json({success:false,message:'Only active credentials can be revoked'});res.json({success:true,data})}catch(error){next(error)}};
exports.restoreCertificate=async(req,res,next)=>{try{let data;await withTransaction(async session=>{data=await Certificate.findOne({_id:req.params.id,status:'revoked'}).session(session);if(!data)return;if(data.expiryDate&&data.expiryDate<=new Date()){data=null;return}const before=data.toObject();data.status='active';data.revokedDate=undefined;data.revokedReason=undefined;await data.save({session});await audit(req,'credential.restore','Certificate',data._id,before,data.toObject(),{session})});if(!data)return res.status(409).json({success:false,message:'Only non-expired revoked credentials can be restored'});res.json({success:true,data})}catch(error){next(error)}};
exports.archiveCertificate=async(req,res,next)=>{try{const reason=String(req.body.reason||'').trim();if(!reason)return res.status(400).json({success:false,message:'Archive reason is required'});let data;await withTransaction(async session=>{data=await Certificate.findOne({_id:req.params.id,status:{$in:['draft','active','expired','revoked']}}).session(session);if(!data)return;const before=data.toObject();data.status='archived';data.archivedAt=new Date();data.archivedBy=req.user._id;await data.save({session});await audit(req,'credential.archive','Certificate',data._id,before,{status:data.status,archivedAt:data.archivedAt,archivedBy:data.archivedBy,reason},{session})});if(!data)return res.status(409).json({success:false,message:'Credential cannot be archived from its current state'});res.json({success:true,data})}catch(error){next(error)}};
exports.unarchiveCertificate=async(req,res,next)=>{try{let data;await withTransaction(async session=>{data=await Certificate.findOne({_id:req.params.id,status:'archived'}).session(session);if(!data)return;const before=data.toObject();data.status=data.expiryDate&&data.expiryDate<=new Date()?'expired':'active';data.archivedAt=undefined;data.archivedBy=undefined;await data.save({session});await audit(req,'credential.unarchive','Certificate',data._id,before,{status:data.status},{session})});if(!data)return res.status(409).json({success:false,message:'Only archived credentials can be restored'});res.json({success:true,data})}catch(error){next(error)}};
exports.getCertificateHistory=async(req,res,next)=>{try{const data=await Certificate.findById(req.params.id);if(!data)return res.status(404).json({success:false,message:'Credential not found'});res.json({success:true,data:{createdAt:data.createdAt,issueDate:data.issueDate,revokedDate:data.revokedDate,status:data.status}})}catch(error){next(error)}};
exports.exportCertificates = async (req, res, next) => {
  try {
    const exportQuery=req.query.status?{status:req.query.status}:{status:{$ne:'deleted'}};if(req.query.certificateType)exportQuery.certificateType=req.query.certificateType;if(req.query.search){const pattern=new RegExp(escapeRegex(req.query.search.trim()),'i');exportQuery.$or=[{certificateId:pattern},{credentialReference:pattern},{credentialTitle:pattern},{recipientName:pattern}]}const data = await Certificate.find(exportQuery).select('+traineeName +courseTitle').lean();
    const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = [['certificateId','recipientName','credentialTitle','credentialType','issueDate','expiryDate','status']
      .map(escapeCsv).join(','), ...data.map(row => [row.certificateId,row.recipientName||row.userName||row.traineeName,row.credentialTitle||row.courseTitle,row.certificateType,row.issueDate?.toISOString?.()||row.issueDate,row.expiryDate?.toISOString?.()||row.expiryDate,row.isRevoked?'revoked':row.isValid?'active':'invalid'].map(escapeCsv).join(','))];
    await audit(req,'credential.export','Certificate',null,null,{count:data.length,filters:req.query});
    res.set('Content-Type','text/csv; charset=utf-8');
    res.set('Content-Disposition','attachment; filename="greendye-credentials.csv"');
    res.send(`\uFEFF${lines.join('\n')}`);
  } catch (error) { next(error); }
};
exports.deleteCertificate=async(req,res,next)=>{try{const reason=String(req.body.reason||'').trim();if(!reason)return res.status(400).json({success:false,message:'Deletion reason is required'});let data;await withTransaction(async session=>{data=await Certificate.findOne({_id:req.params.id,status:{$ne:'deleted'}}).session(session);if(!data)return;const before=data.toObject();data.status='deleted';data.deletedAt=new Date();data.deletedBy=req.user._id;data.deletionReason=reason;await data.save({session});await audit(req,'credential.delete','Certificate',data._id,before,data.toObject(),{session})});if(!data)return res.status(404).json({success:false,message:'Credential not found'});res.json({success:true})}catch(error){next(error)}};
