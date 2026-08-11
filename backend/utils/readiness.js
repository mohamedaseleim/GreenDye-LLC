const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const state={storage:false,tools:false,scanner:false,checkedAt:null};
const run=(command,args=[])=>new Promise(resolve=>{const child=spawn(command,args,{stdio:'ignore'});child.once('error',()=>resolve(false));child.once('close',code=>resolve(code===0))});
const refresh=async()=>{try{fs.accessSync(path.join(__dirname,'../private_uploads'),fs.constants.W_OK);state.storage=true}catch{state.storage=false}state.tools=(await run('mongodump',['--version']))&&(await run('mongorestore',['--version']));state.scanner=process.env.MALWARE_SCAN_ENABLED!=='true'||await run(process.env.CLAMSCAN_COMMAND||'clamscan',['--version']);state.checkedAt=new Date().toISOString();return state};
module.exports={state,refresh};
