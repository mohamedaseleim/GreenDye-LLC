const fs=require('fs'),p=require('path'),r=p.resolve(__dirname,'../..'),q=x=>fs.readFileSync(p.join(r,x),'utf8');
const checks={
 apiNotCached:!q('frontend/public/service-worker.js').includes("cache.put(event.request" )&&!q('frontend/public/service-worker.js').includes("url.includes('/api/')"),
 noMongoPublicBind:q('docker-compose.yml').includes('127.0.0.1:27017:27017'),
 pinnedMongo:q('docker-compose.yml').includes('mongo:7.0.16-jammy'),
 requiredProductionSecrets:q('docker-compose.production.yml').includes('MONGO_ROOT_PASSWORD is required'),
 centralizedApiClient:fs.existsSync(p.join(r,'frontend/src/services/apiClient.js')),
 superAdminProfessionalRoute:q('frontend/src/components/TrainerRoute.js').includes("'super_admin'"),
 currentDocs:fs.existsSync(p.join(r,'docs/CURRENT_DOCUMENTATION.md')),
 ci:fs.existsSync(p.join(r,'.github/workflows/quality.yml'))
};
console.log(JSON.stringify(checks,null,2));if(Object.values(checks).some(v=>!v))process.exit(1);
