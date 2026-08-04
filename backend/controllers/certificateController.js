const Certificate=require('../models/Certificate');
exports.getCertificates=async(req,res,next)=>{try{const data=await Certificate.find({user:req.user._id}).sort({issueDate:-1});res.json({success:true,data});}catch(e){next(e)}};
exports.getCertificate=async(req,res,next)=>{try{const data=await Certificate.findOne({_id:req.params.id,user:req.user._id});if(!data)return res.status(404).json({success:false,message:'Certificate not found'});res.json({success:true,data});}catch(e){next(e)}};
exports.generateCertificate=async(req,res,next)=>{try{const data=await Certificate.create({...req.body,user:req.body.user||req.user._id});res.status(201).json({success:true,data});}catch(e){next(e)}};
exports.downloadCertificate=async(req,res,next)=>{try{const data=await Certificate.findById(req.params.id);if(!data)return res.status(404).json({success:false,message:'Certificate not found'});res.json({success:true,data,pdfUrl:data.pdfUrl});}catch(e){next(e)}};
