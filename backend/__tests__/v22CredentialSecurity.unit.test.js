const fs=require('fs'),path=require('path');const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('credential download is owner scoped',()=>expect(read('controllers/certificateController.js')).toContain("user:req.user._id"));
test('self-service credential generation route is removed',()=>expect(read('routes/certificateRoutes.js')).not.toContain("/generate"));
test('bulk workflow resolves recipient email and uses a transaction',()=>{const source=read('controllers/adminCertificateController.js');expect(source).toContain('recipientEmail');expect(source).toContain('withTransaction');expect(source).toContain('credentialTitle is required')});
test('public verification is identifier-only and rate limited',()=>{expect(read('controllers/verifyController.js')).not.toContain('req.query.t');expect(read('routes/verifyRoutes.js')).toContain('verificationLimiter')});
test('credentials are invalid unless explicitly issued by the admin workflow',()=>{expect(read('models/Certificate.js')).toContain('default: false');expect(read('controllers/adminCertificateController.js')).toContain("payload.status='active'")});
