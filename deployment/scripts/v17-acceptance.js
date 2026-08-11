const fs=require('fs'),p=require('path'),r=p.resolve(__dirname,'../..');
const walk=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.name==='node_modules'?[]:e.isDirectory()?walk(p.join(d,e.name)):[p.join(d,e.name)]):[];
const source=walk(p.join(r,'frontend/src')).filter(x=>x.endsWith('.js')&&!x.includes('__tests__'));
const directToken=source.filter(file=>!file.endsWith('tokenStore.js')&&fs.readFileSync(file,'utf8').includes("localStorage.getItem('token')"));
const controller=fs.readFileSync(p.join(r,'backend/controllers/consultingOperationsController.js'),'utf8');
const checks={
 tokenCentralized:directToken.length===0,
 sessionStorage:fs.readFileSync(p.join(r,'frontend/src/services/tokenStore.js'),'utf8').includes('sessionStorage'),
 termsRecalculated:controller.includes('calculatePaymentTerms(sourceTerms,price.total,price.currency)'),
 atomicProposalUpdate:controller.includes('findOneAndUpdate({_id:current._id,version:expectedVersion,isLocked:false'),
 nativeRawMigration:fs.readFileSync(p.join(r,'backend/scripts/migrate-money-minor-units.js'),'utf8').includes('Model.collection.find({})'),
 clamavImage:fs.readFileSync(p.join(r,'backend/Dockerfile'),'utf8').includes('clamav'),
 noForumModel:!fs.existsSync(p.join(r,'backend/models/Forum.js')),
 noForumClient:!fs.existsSync(p.join(r,'frontend/src/services/forumService.js')),
 noForumRoute:!fs.readFileSync(p.join(r,'backend/routes/adminCMSRoutes.js'),'utf8').includes('/moderation/forums'),
 financeBehaviorTest:fs.existsSync(p.join(r,'backend/__tests__/v17Finance.unit.test.js'))
};
console.log(JSON.stringify({...checks,directToken},null,2));if(Object.values(checks).some(v=>!v))process.exit(1);
