const router=require('express').Router(); const v=require('../controllers/verifyController');
router.get('/certificate/:certificateId',v.verifyCertificate); router.get('/trainer/:trainerId',v.verifyTrainer); router.get('/consultant/:consultantId',v.verifyConsultant); module.exports=router;
