const mongoose = require('mongoose');

const contentSettingsSchema = new mongoose.Schema(
  {
    homePage: {
      heroTitle: {
        en: { type: String, default: 'Welcome to GreenDye Academy' },
        ar: { type: String, default: 'مرحبًا بك في أكاديمية GreenDye' },
        fr: { type: String, default: 'Bienvenue à l\'Académie GreenDye' },
      },
      heroSubtitle: {
        en: { type: String, default: 'Learn, Grow, and Succeed with Quality Education' },
        ar: { type: String, default: 'تعلم، انمو، وانجح مع التعليم الجيد' },
        fr: { type: String, default: 'Apprendre, Grandir et Réussir avec une Éducation de Qualité' },
      },
      features: [
        {
          icon: { type: String, default: 'School' },
          title: { type: String, default: 'Quality Education' },
          description: { type: String, default: 'Access world-class courses from expert trainers' },
        },
      ],
    },
    aboutPage: {
      mission: {
        en: { type: String, default: 'GreenDye Academy is committed to democratizing education by providing accessible, high-quality training and qualification programs to students and professionals across Africa, Asia, and the Middle East, with a primary focus on Egypt.' },
        ar: { type: String, default: 'تلتزم أكاديمية GreenDye بإضفاء الطابع الديمقراطي على التعليم من خلال توفير برامج تدريب وتأهيل عالية الجودة وسهلة المنال للطلاب والمهنيين في جميع أنحاء أفريقيا وآسيا والشرق الأوسط، مع التركيز الأساسي على مصر.' },
        fr: { type: String, default: 'GreenDye Academy s\'engage à démocratiser l\'éducation en fournissant des programmes de formation et de qualification accessibles et de haute qualité aux étudiants et professionnels à travers l\'Afrique, l\'Asie et le Moyen-Orient, avec un accent particulier sur l\'Égypte.' },
      },
      vision: {
        en: { type: String, default: 'To become the leading e-learning platform in the region, recognized for quality education, verified certifications, and excellent learning experiences.' },
        ar: { type: String, default: 'أن تصبح منصة التعليم الإلكتروني الرائدة في المنطقة، المعترف بها من أجل التعليم الجيد والشهادات الموثقة وتجارب التعلم الممتازة.' },
        fr: { type: String, default: 'Devenir la plateforme d\'apprentissage en ligne leader dans la région, reconnue pour son éducation de qualité, ses certifications vérifiées et ses excellentes expériences d\'apprentissage.' },
      },
      features: [
        {
          icon: { type: String, default: 'School' },
          title: { type: String, default: 'Quality Education' },
          description: { type: String, default: 'We provide world-class courses from expert trainers across multiple disciplines and industries.' },
        },
      ],
    },
    contactPage: {
      email: { type: String, default: 'info@greendye-academy.com' },
      phone: { type: String, default: '+20 123 456 7890' },
      address: { type: String, default: 'Cairo, Egypt' },
      officeHours: {
        en: { type: String, default: 'Sunday - Thursday: 9:00 AM - 6:00 PM' },
        ar: { type: String, default: 'الأحد - الخميس: 9:00 صباحًا - 6:00 مساءً' },
        fr: { type: String, default: 'Dimanche - Jeudi: 9h00 - 18h00' },
      },
    },
    socialMedia: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ContentSettings', contentSettingsSchema);
