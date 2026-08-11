const dictionaries={
 en:{internal:'Internal server error',notFound:'Route not found',unauthorized:'Authentication required',forbidden:'You do not have permission to perform this action'},
 ar:{internal:'حدث خطأ داخلي في الخادم',notFound:'المسار غير موجود',unauthorized:'يلزم تسجيل الدخول',forbidden:'ليست لديك صلاحية لتنفيذ هذا الإجراء'},
 fr:{internal:'Erreur interne du serveur',notFound:'Route introuvable',unauthorized:'Authentification requise',forbidden:"Vous n’avez pas l’autorisation d’effectuer cette action"}
};
const business={
 'Proposal not found':{ar:'العرض غير موجود',fr:'Proposition introuvable'},'Invoice not found':{ar:'الفاتورة غير موجودة',fr:'Facture introuvable'},'Invalid decision':{ar:'قرار غير صالح',fr:'Décision non valide'},'Invalid payment amount or fees':{ar:'مبلغ الدفعة أو الرسوم غير صالح',fr:'Montant du paiement ou frais non valides'},'Project not found':{ar:'المشروع غير موجود',fr:'Projet introuvable'},'Active user not found':{ar:'المستخدم النشط غير موجود',fr:'Utilisateur actif introuvable'},'Invalid project role':{ar:'دور المشروع غير صالح',fr:'Rôle de projet non valide'}
};
exports.message=(language,key)=>dictionaries[language]?.[key]||dictionaries.en[key]||key;
exports.localize=(language,text)=>business[text]?.[language]||text;
