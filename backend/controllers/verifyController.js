const Certificate=require('../models/Certificate');
const Trainer=require('../models/Trainer');
const Consultant=require('../models/Consultant');

const certificateStatus=certificate=>certificate.expiryDate&&certificate.expiryDate<new Date()&&certificate.status==='active'?'expired':certificate.status;

exports.verifyCertificate=async(req,res,next)=>{try{
  const query={certificateId:req.params.certificateId,status:{$nin:['deleted','archived','draft']}};
  const certificate=await Certificate.findOne(query).select('certificateId certificateType source recipientName userName credentialTitle credentialReference certificateLevel traineeName courseTitle issueDate expiryDate status metadata.issuedBy metadata.scheme');
  if(!certificate)return res.status(404).json({success:false,verified:false,status:'not_found',message:'Credential not found'});
  const status=certificateStatus(certificate),verified=status==='active';
  const data={certificateId:certificate.certificateId,credentialType:certificate.certificateType,source:certificate.source,recipientName:certificate.recipientName||certificate.traineeName||certificate.userName,credentialTitle:certificate.credentialTitle||certificate.courseTitle,credentialReference:certificate.credentialReference,credentialLevel:certificate.certificateLevel,issueDate:certificate.issueDate,expiryDate:certificate.expiryDate,status,issuer:certificate.metadata?.issuedBy,scheme:certificate.metadata?.scheme};
  Object.keys(data).forEach(key=>data[key]===undefined&&delete data[key]);
  res.json({success:true,verified,status,message:verified?'Credential is valid':`Credential is ${status}`,data});
}catch(error){next(error)}};

exports.verifyTrainer=async(req,res,next)=>{try{
  const trainer=await Trainer.findOne({trainerId:req.params.trainerId}).select('trainerId fullName title bio expertise experience qualifications certifications specializations languages isVerified isActive applicationStatus verificationDate verificationUrl');
  if(!trainer)return res.status(404).json({success:false,verified:false,status:'not_found',message:'Trainer not found'});
  const verified=trainer.isActive&&trainer.applicationStatus==='approved';
  const status=!trainer.isActive?'inactive':verified?'approved':'unverified';
  const data=trainer.toObject();data.verificationStatus=status;
  const message=!trainer.isActive?'Trainer account is not active':verified?'Trainer is verified and active':'Trainer is not verified';
  res.json({success:true,verified,status,message,data});
}catch(error){next(error)}};

exports.verifyConsultant=async(req,res,next)=>{try{
  const consultant=await Consultant.findOne({consultantId:req.params.consultantId,isPublic:true}).select('consultantId fullName professionalTitle expertise industries yearsOfExperience verificationStatus accreditationNumber accreditationIssueDate accreditationExpiryDate verificationUrl');
  if(!consultant)return res.status(404).json({success:false,verified:false,status:'not_found',message:'Consultant not found'});
  const status=consultant.verificationStatus||'unverified';
  const expired=consultant.accreditationExpiryDate&&consultant.accreditationExpiryDate<new Date();
  const verified=!expired&&['approved','verified','active'].includes(String(status).toLowerCase());
  res.json({success:true,verified,status:expired?'expired':status,message:verified?'Consultant is verified':'Consultant is not verified',data:consultant});
}catch(error){next(error)}};
