const request=require('supertest');
const {app}=require('../../server');
const Trainer=require('../../models/Trainer');
const Certificate=require('../../models/Certificate');
const User=require('../../models/User');

describe('Public verification contracts',()=>{
  let user,trainer,credential;
  beforeEach(async()=>{
    user=await User.create({name:'Verified Professional',email:`verify-${Date.now()}@example.com`,password:'Password123!',role:'trainer'});
    trainer=await Trainer.create({user:user._id,fullName:'Verified Professional',title:{en:'Professional Trainer'},bio:{en:'Public biography'},expertise:['Quality'],experience:8,applicationStatus:'approved',isActive:true,isVerified:true});
    credential=await Certificate.create({recipientName:'Credential Holder',credentialTitle:'Professional Credential',credentialReference:'REF-001',status:'active'});
  });
  test('returns a stable active credential contract',async()=>{
    const response=await request(app).get(`/api/verify/certificate/${credential.certificateId}?t=${credential.verificationToken}`).expect(200);
    expect(response.body).toMatchObject({success:true,verified:true,status:'active',message:'Credential is valid'});
    expect(response.body.data).toMatchObject({recipientName:'Credential Holder',credentialTitle:'Professional Credential',status:'active'});
    expect(response.body.data.courseTitle).toBeUndefined();
  });
  test('returns a stable verified trainer contract without private fields',async()=>{
    const response=await request(app).get(`/api/verify/trainer/${trainer.trainerId}`).expect(200);
    expect(response.body).toMatchObject({success:true,verified:true,status:'approved',message:'Trainer is verified and active'});
    expect(response.body.data.fullName).toBe('Verified Professional');
    expect(response.body.data.commissionRate).toBeUndefined();
  });
  test('reports inactive trainers without exposing private fields',async()=>{
    trainer.isActive=false;await trainer.save();
    const response=await request(app).get(`/api/verify/trainer/${trainer.trainerId}`).expect(200);
    expect(response.body).toMatchObject({success:true,verified:false,status:'inactive',message:'Trainer account is not active'});
  });
  test('returns explicit not-found contracts',async()=>{
    const trainerResponse=await request(app).get('/api/verify/trainer/TR-NOTFOUND').expect(404);
    expect(trainerResponse.body).toMatchObject({success:false,verified:false,status:'not_found'});
    const credentialResponse=await request(app).get('/api/verify/certificate/CERT-NOTFOUND').expect(404);
    expect(credentialResponse.body).toMatchObject({success:false,verified:false,status:'not_found'});
  });
});
