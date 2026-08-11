const request=require('supertest');
const fs=require('fs');
const path=require('path');
const {app}=require('../../server');
const User=require('../../models/User');
const Certificate=require('../../models/Certificate');

describe('Credential privacy, pagination, and download',()=>{
  let admin,owner,adminToken,ownerToken;
  beforeEach(async()=>{
    admin=await User.create({name:'Admin',email:`admin-${Date.now()}@example.com`,password:'Password123!',role:'admin',isVerified:true});
    owner=await User.create({name:'Owner',email:`owner-${Date.now()}@example.com`,password:'Password123!',role:'individual_client',isVerified:true});
    adminToken=admin.getSignedJwtToken();ownerToken=owner.getSignedJwtToken();
  });
  test('public verification excludes private metadata and revocation reasons',async()=>{
    const credential=await Certificate.create({user:owner._id,recipientName:'Public Holder',credentialTitle:'Public Credential',credentialReference:`PRIV-${Date.now()}`,status:'active',metadata:{issuedBy:'GreenDye for Training and Consultancy',scheme:'Public Scheme',recipientEmail:owner.email,issuerUser:admin._id}});
    const response=await request(app).get(`/api/verify/certificate/${credential.certificateId}`).expect(200);
    expect(response.body.data).toMatchObject({recipientName:'Public Holder',issuer:'GreenDye for Training and Consultancy',scheme:'Public Scheme'});
    expect(response.body.data.metadata).toBeUndefined();expect(response.body.data.recipientEmail).toBeUndefined();expect(response.body.data.issuerUser).toBeUndefined();expect(response.body.data.revokedReason).toBeUndefined();
  });
  test('admin pagination returns a bounded page and accurate total',async()=>{
    await Certificate.create([{recipientName:'One',credentialTitle:'Search Alpha',credentialReference:`PAGE-A-${Date.now()}`,status:'active'},{recipientName:'Two',credentialTitle:'Search Alpha',credentialReference:`PAGE-B-${Date.now()}`,status:'active'}]);
    const response=await request(app).get('/api/admin/certificates?page=1&limit=1&search=Search%20Alpha').set('Authorization',`Bearer ${adminToken}`).expect(200);
    expect(response.body.data).toHaveLength(1);expect(response.body.total).toBe(2);expect(response.body.limit).toBe(1);
  });
  test('owner downloads a private credential PDF as an attachment',async()=>{
    const root=path.resolve(__dirname,'../../private_uploads/certificates');await fs.promises.mkdir(root,{recursive:true});const name=`credential-${Date.now()}.pdf`;await fs.promises.writeFile(path.join(root,name),'%PDF-1.4\n%%EOF');
    const credential=await Certificate.create({user:owner._id,recipientName:'Owner',credentialTitle:'Download Credential',credentialReference:`PDF-${Date.now()}`,status:'active',pdfUrl:name});
    const response=await request(app).get(`/api/certificates/${credential._id}/download`).set('Authorization',`Bearer ${ownerToken}`).buffer(true).parse((res,callback)=>{const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('end',()=>callback(null,Buffer.concat(chunks)))}).expect(200);
    expect(response.headers['content-type']).toContain('application/pdf');expect(response.headers['content-disposition']).toContain('attachment');await fs.promises.unlink(path.join(root,name));
  });
});
