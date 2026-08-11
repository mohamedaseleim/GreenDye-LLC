const {spawnSync}=require('child_process');
const path=require('path');
const scripts=['v9-acceptance.js','v10-acceptance.js','v11-acceptance.js','v12-acceptance.js','v13-acceptance.js','v14-acceptance.js','v16-acceptance.js','v17-acceptance.js','v18-acceptance.js','v19-acceptance.js','v20-acceptance.js','v21-acceptance.js','v22-acceptance.js','v23-acceptance.js','v24-acceptance.js'];
for(const script of scripts){
  const result=spawnSync(process.execPath,[path.join(__dirname,script)],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);
}
console.log(JSON.stringify({success:true,scripts},null,2));
