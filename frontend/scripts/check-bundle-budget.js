const fs=require('fs'),path=require('path'),zlib=require('zlib');
const dir=path.resolve(__dirname,'../build/static/js');
if(!fs.existsSync(dir))throw new Error('Build output not found');
const rows=fs.readdirSync(dir).filter(x=>x.endsWith('.js')).map(file=>{const data=fs.readFileSync(path.join(dir,file));return{file,raw:data.length,gzip:zlib.gzipSync(data,{level:9}).length}}).sort((a,b)=>b.gzip-a.gzip);
const main=rows.find(x=>x.file.startsWith('main.'));const limits={main:220000,chunk:250000,total:500000};const total=rows.reduce((n,x)=>n+x.gzip,0);const report={main,largest:rows.slice(0,10),totalGzip:total,chunks:rows.length,limits};console.log(JSON.stringify(report,null,2));if(!main||main.gzip>limits.main||rows[0].gzip>limits.chunk||total>limits.total)process.exit(1);
