const {hasRole}=require('./roles');
exports.proposalScope=req=>hasRole(req.user,'admin','super_admin')?{}:{preparedBy:req.user._id};
