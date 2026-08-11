const router=require('express').Router();
const rateLimit=require('express-rate-limit');
const v=require('../controllers/verifyController');
const verificationLimiter=rateLimit({windowMs:15*60*1000,max:60,standardHeaders:true,legacyHeaders:false,message:{success:false,verified:false,status:'rate_limited',message:'Too many verification requests'}});
router.use(verificationLimiter);
router.get('/certificate/:certificateId',v.verifyCertificate);
router.get('/trainer/:trainerId',v.verifyTrainer);
router.get('/consultant/:consultantId',v.verifyConsultant);
module.exports=router;
