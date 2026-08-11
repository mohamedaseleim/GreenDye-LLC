const getUserRoles=user=>[user?.role,...(Array.isArray(user?.roles)?user.roles:[])].filter(Boolean);
const hasRole=(user,...allowed)=>allowed.some(role=>getUserRoles(user).includes(role));
const isAdministrator=user=>hasRole(user,'admin','super_admin');
module.exports={getUserRoles,hasRole,isAdministrator};
