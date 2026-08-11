const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '../..');
const failures = [];
const checks = [];
const check = (name, condition, detail='') => { checks.push({name,ok:Boolean(condition),detail}); if(!condition) failures.push(name); };
const backendEnv = path.join(root,'backend','.env.production');
check('backend .env.production exists', fs.existsSync(backendEnv));
if (fs.existsSync(backendEnv)) {
  const env = Object.fromEntries(fs.readFileSync(backendEnv,'utf8').split(/\r?\n/).filter(x=>x&&!x.startsWith('#')&&x.includes('=')).map(line=>{const i=line.indexOf('=');return[line.slice(0,i),line.slice(i+1)]}));
  for(const key of ['MONGODB_URI','JWT_SECRET','FRONTEND_URL','PUBLIC_BASE_URL','SMTP_HOST','SMTP_USER','SMTP_PASSWORD','FROM_EMAIL']) check(`env ${key}`, Boolean(env[key]));
  check('JWT secret strength', (env.JWT_SECRET||'').length>=64 && !/replace|generate|secret/i.test(env.JWT_SECRET||''));
  check('Mongo replica set URI', (env.MONGODB_URI||'').includes('replicaSet='));
  check('HTTPS frontend', (env.FRONTEND_URL||'').startsWith('https://'));
  check('production restore disabled', env.ALLOW_PRODUCTION_RESTORE==='false');
}
check('frontend production env exists', fs.existsSync(path.join(root,'frontend','.env.production')));
check('private uploads not under public html', !path.resolve(root,'backend','private_uploads').includes('public_html'));
check('production compose exists', fs.existsSync(path.join(root,'docker-compose.production.yml')));
check('Node 20 runtime', Number(process.versions.node.split('.')[0])===20, process.version);
console.log(JSON.stringify({timestamp:new Date().toISOString(),nonce:crypto.randomBytes(8).toString('hex'),checks},null,2));
if(failures.length){console.error(`Preflight failed: ${failures.join(', ')}`);process.exit(1)}
