const Migration=require('../models/SystemMigration');
const REQUIRED=['money_minor_units_v1','credential_reference_unique_v1'];
let migrationReady=false;
exports.assertRequiredMigrations=async()=>{if(process.env.NODE_ENV!=='production'){migrationReady=true;return}const rows=await Migration.find({_id:{$in:REQUIRED},status:'completed'}).select('_id').lean();const completed=new Set(rows.map(row=>row._id));const missing=REQUIRED.filter(id=>!completed.has(id));migrationReady=missing.length===0;if(!migrationReady)throw new Error(`Required migrations are not completed: ${missing.join(', ')}`)};
exports.requireFinancialMigration=(req,res,next)=>migrationReady?next():res.status(503).json({success:false,message:'Services are unavailable until required migrations are completed'});
exports.isMigrationReady=()=>migrationReady;
exports.REQUIRED_MIGRATIONS=REQUIRED;
