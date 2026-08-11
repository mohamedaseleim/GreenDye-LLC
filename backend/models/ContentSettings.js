const mongoose=require('mongoose');
const localized=(en,ar,fr)=>({en:{type:String,default:en},ar:{type:String,default:ar},fr:{type:String,default:fr}});
const featureSchema=new mongoose.Schema({
  icon:{type:String,default:'Assessment'},
  title:localized('Consultancy expertise','خبرات استشارية','Expertise en conseil'),
  description:localized('Practical, measurable solutions for organizations and professionals.','حلول عملية قابلة للقياس للمؤسسات والمهنيين.','Des solutions pratiques et mesurables pour les organisations et les professionnels.')
},{_id:false});
const contentSettingsSchema=new mongoose.Schema({
  homePage:{
    heroTitle:localized('GreenDye for Training and Consultancy','GreenDye للتدريب والاستشارات','GreenDye pour la formation et le conseil'),
    heroSubtitle:localized('Consultancy, professional accreditation, and project delivery for sustainable performance.','استشارات واعتماد مهني وتنفيذ مشروعات لأداء مستدام.','Conseil, accréditation professionnelle et réalisation de projets pour une performance durable.'),
    features:{type:[featureSchema],default:()=>[
      {icon:'Assessment',title:{en:'Consultancy solutions',ar:'حلول استشارية',fr:'Solutions de conseil'},description:{en:'Structured engagements aligned with measurable business outcomes.',ar:'تكليفات منظمة مرتبطة بنتائج أعمال قابلة للقياس.',fr:'Des missions structurées alignées sur des résultats mesurables.'}},
      {icon:'Verified',title:{en:'Professional accreditation',ar:'اعتماد مهني',fr:'Accréditation professionnelle'},description:{en:'Verifiable credentials with controlled issuance and public validation.',ar:'اعتمادات قابلة للتحقق مع إصدار منضبط وتحقق عام.',fr:'Des titres vérifiables avec émission contrôlée et validation publique.'}},
      {icon:'School',title:{en:'Independent training platform',ar:'منصة تدريب مستقلة',fr:'Plateforme de formation indépendante'},description:{en:'Courses and learning records are managed exclusively through the independent Moodle platform.',ar:'تُدار الدورات وسجلات التعلم حصريًا عبر منصة Moodle المستقلة.',fr:'Les cours et dossiers pédagogiques sont gérés exclusivement sur la plateforme Moodle indépendante.'}}
    ]}
  },
  aboutPage:{
    mission:localized('We help individuals and organizations improve performance through practical consultancy, professional accreditation, and disciplined project delivery. Training programs are delivered through our independent Moodle platform.','نساعد الأفراد والمؤسسات على تحسين الأداء من خلال الاستشارات العملية والاعتماد المهني والتنفيذ المنضبط للمشروعات. وتُقدم البرامج التدريبية عبر منصة Moodle المستقلة.','Nous aidons les personnes et les organisations à améliorer leurs performances grâce au conseil pratique, à l’accréditation professionnelle et à une réalisation rigoureuse des projets. Les formations sont dispensées sur notre plateforme Moodle indépendante.'),
    vision:localized('To be a trusted international partner for organizational transformation, professional capability, and sustainable operational excellence.','أن نكون شريكًا دوليًا موثوقًا للتحول المؤسسي وبناء القدرات المهنية والتميز التشغيلي المستدام.','Être un partenaire international de confiance pour la transformation organisationnelle, les capacités professionnelles et l’excellence opérationnelle durable.'),
    features:{type:[featureSchema],default:()=>[
      {icon:'BusinessCenter',title:{en:'Sector expertise',ar:'خبرة قطاعية',fr:'Expertise sectorielle'},description:{en:'Context-aware advice for institutions, companies, and factories.',ar:'استشارات تراعي سياق المؤسسات والشركات والمصانع.',fr:'Des conseils adaptés aux institutions, entreprises et usines.'}},
      {icon:'TrendingUp',title:{en:'Measurable impact',ar:'أثر قابل للقياس',fr:'Impact mesurable'},description:{en:'Clear objectives, milestones, risks, and evidence of delivery.',ar:'أهداف ومراحل ومخاطر وأدلة إنجاز واضحة.',fr:'Des objectifs, jalons, risques et preuves de réalisation clairs.'}},
      {icon:'Security',title:{en:'Controlled delivery',ar:'تنفيذ منضبط',fr:'Réalisation maîtrisée'},description:{en:'Role-based access, audit trails, and protected project documents.',ar:'صلاحيات حسب الدور وسجلات تدقيق ووثائق مشروعات محمية.',fr:'Accès par rôle, pistes d’audit et documents de projet protégés.'}}
    ]}
  },
  contactPage:{email:{type:String,default:'info@greendye.org'},phone:{type:String,default:''},address:{type:String,default:'Egypt'},officeHours:localized('Sunday - Thursday: 9:00 AM - 6:00 PM','الأحد - الخميس: 9:00 صباحًا - 6:00 مساءً','Dimanche - jeudi : 9h00 - 18h00')},
  socialMedia:{facebook:{type:String,default:''},twitter:{type:String,default:''},linkedin:{type:String,default:''},instagram:{type:String,default:''},youtube:{type:String,default:''}}
},{timestamps:true});
module.exports=mongoose.model('ContentSettings',contentSettingsSchema);
