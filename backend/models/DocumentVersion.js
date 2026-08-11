const mongoose=require('mongoose');
const schema=new mongoose.Schema({
  project:{type:mongoose.Schema.Types.ObjectId,ref:'ConsultingProject',required:true,index:true},deliverable:{type:mongoose.Schema.Types.ObjectId,ref:'Deliverable'},
  category:{type:String,enum:['proposal','contract','nda','report','evidence','invoice','meeting_minutes','other'],default:'other'},title:{type:String,required:true},version:{type:Number,required:true},
  classification:{type:String,enum:['standard','confidential','highly_confidential'],default:'confidential'},storageKey:{type:String,required:true,select:false},originalName:String,mimeType:String,size:Number,sha256:{type:String,required:true},uploadedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},notes:String,
  status:{type:String,enum:['active','archived','deleted'],default:'active',index:true},archivedAt:Date,archivedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},deletedAt:Date,deletedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
},{timestamps:true});
schema.index({project:1,title:1,version:1},{unique:true});
module.exports=mongoose.model('DocumentVersion',schema);
