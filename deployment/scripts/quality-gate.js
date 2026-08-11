const fs=require('fs');const path=require('path');const root=path.resolve(__dirname,'../..');const fail=[];
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.name==='node_modules'||e.name==='build'?[]:e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
for(const file of walk(path.join(root,'backend','controllers')).filter(x=>x.endsWith('.js'))){const s=fs.readFileSync(file,'utf8'),names=[...s.matchAll(/exports\.(\w+)\s*=/g)].map(x=>x[1]);for(const n of new Set(names))if(names.filter(x=>x===n).length>1)fail.push(`duplicate export ${file}:${n}`);if(/\.\.\.req\.body/.test(s))fail.push(`mass assignment ${file}`)}
const locales={};for(const l of ['en','ar','fr'])locales[l]=JSON.parse(fs.readFileSync(path.join(root,'frontend','src','locales',l,'translation.json')));const keys=Object.keys(locales.en).sort().join('|');for(const l of ['ar','fr'])if(Object.keys(locales[l]).sort().join('|')!==keys)fail.push(`translation mismatch ${l}`);
const used=new Set();for(const f of walk(path.join(root,'frontend','src')).filter(x=>x.endsWith('.js')))for(const m of fs.readFileSync(f,'utf8').matchAll(/\bt\(['"]([^'"]+)/g))used.add(m[1]);for(const k of used)if(!(k in locales.en))fail.push(`missing translation ${k}`);
for(const f of walk(path.join(root,'backend')).filter(x=>x.endsWith('.js')))try{require('child_process').execFileSync(process.execPath,['--check',f],{stdio:'ignore'})}catch{fail.push(`syntax ${f}`)}

const ops=fs.readFileSync(path.join(root,'backend','controllers','consultingOperationsController.js'),'utf8');
const opRoutes=fs.readFileSync(path.join(root,'backend','routes','consultingOperationsRoutes.js'),'utf8');
if(!opRoutes.includes('/projects/:projectId/invoices/:invoiceId/status')||!ops.includes('_id:req.params.invoiceId,project:req.project._id'))fail.push('invoice status is not project scoped');
if(!ops.includes('expectedVersion'))fail.push('proposal optimistic concurrency missing');
if(!fs.readFileSync(path.join(root,'backend','models','Proposal.js'),'utf8').includes('taxRate:'))fail.push('proposal taxRate missing');
const enhancements=fs.readFileSync(path.join(root,'backend','controllers','consultingEnhancementsController.js'),'utf8');
if(!enhancements.includes('different payment request')||!enhancements.includes('refundPayment'))fail.push('payment idempotency/refund guards missing');
if(!fs.readFileSync(path.join(root,'backend','routes','userRoutes.js'),'utf8').includes("authorize('admin', 'super_admin')"))fail.push('super_admin user administration missing');

if(fail.length){console.error(fail.join('\n'));process.exit(1)}console.log(JSON.stringify({success:true,controllerDuplicates:0,massAssignmentSpreads:0,translationKeys:Object.keys(locales.en).length,usedTranslationKeys:used.size,languages:['en','ar','fr']},null,2));
