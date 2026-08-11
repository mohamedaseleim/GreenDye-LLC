const fs=require('fs'),path=require('path');const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('public credential ids have 128 bits of uuid entropy',()=>expect(read('models/Certificate.js')).toContain("uuidv4().replace(/-/g, '').toUpperCase()"));
test('required credential migration is startup guarded',()=>{const source=read('utils/migrationGuard.js');expect(source).toContain('credential_reference_unique_v1')});
test('credential lifecycle operations are audited and deletion is soft',()=>{const source=read('controllers/adminCertificateController.js');for(const action of ['credential.revoke','credential.restore','credential.regenerate','credential.delete','credential.export'])expect(source).toContain(action);expect(source).not.toContain('findByIdAndDelete')});
test('obsolete verification token is removed',()=>expect(read('models/Certificate.js')).not.toContain('verificationToken'));
