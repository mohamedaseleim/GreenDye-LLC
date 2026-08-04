const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const ContentSettings = require('../models/ContentSettings');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greendye', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const initializeContentSettings = async () => {
  try {
    console.log('🔄 Initializing content settings...');

    // Check if content settings already exist
    let settings = await ContentSettings.findOne();

    if (settings) {
      console.log('ℹ️  Content settings already exist. Skipping initialization.');
      return;
    }

    // Create default content settings
    settings = await ContentSettings.create({
      homePage: {
        heroTitle: {
          en: 'Welcome to GreenDye Academy',
          ar: 'مرحبًا بك في أكاديمية GreenDye',
          fr: 'Bienvenue à l\'Académie GreenDye',
        },
        heroSubtitle: {
          en: 'Learn, Grow, and Succeed with Quality Education',
          ar: 'تعلم، انمو، وانجح مع التعليم الجيد',
          fr: 'Apprendre, Grandir et Réussir avec une Éducation de Qualité',
        },
        features: [
          {
            icon: 'School',
            title: 'Quality Education',
            description: 'Access world-class courses from expert trainers',
          },
          {
            icon: 'Verified',
            title: 'Verified Certificates',
            description: 'Earn verified certificates upon course completion',
          },
          {
            icon: 'Language',
            title: 'Multi-Language Support',
            description: 'Learn in Arabic, English, or French',
          },
          {
            icon: 'People',
            title: 'Expert Trainers',
            description: 'Learn from verified and accredited trainers',
          },
        ],
      },
      aboutPage: {
        mission: {
          en: 'GreenDye Academy is committed to democratizing education by providing accessible, high-quality training and qualification programs to students and professionals across Africa, Asia, and the Middle East, with a primary focus on Egypt. We believe that education is a fundamental right and a powerful tool for personal and professional growth.',
          ar: 'تلتزم أكاديمية GreenDye بإضفاء الطابع الديمقراطي على التعليم من خلال توفير برامج تدريب وتأهيل عالية الجودة وسهلة المنال للطلاب والمهنيين في جميع أنحاء أفريقيا وآسيا والشرق الأوسط، مع التركيز الأساسي على مصر. نؤمن بأن التعليم حق أساسي وأداة قوية للنمو الشخصي والمهني.',
          fr: 'GreenDye Academy s\'engage à démocratiser l\'éducation en fournissant des programmes de formation et de qualification accessibles et de haute qualité aux étudiants et professionnels à travers l\'Afrique, l\'Asie et le Moyen-Orient, avec un accent particulier sur l\'Égypte. Nous croyons que l\'éducation est un droit fondamental et un outil puissant pour la croissance personnelle et professionnelle.',
        },
        vision: {
          en: 'To become the leading e-learning platform in the region, recognized for quality education, verified certifications, and excellent learning experiences. We envision a world where anyone, anywhere, can access world-class education and develop the skills they need to succeed in the modern economy.',
          ar: 'أن تصبح منصة التعليم الإلكتروني الرائدة في المنطقة، المعترف بها من أجل التعليم الجيد والشهادات الموثقة وتجارب التعلم الممتازة. نتصور عالمًا حيث يمكن لأي شخص، في أي مكان، الوصول إلى تعليم عالمي المستوى وتطوير المهارات التي يحتاجونها للنجاح في الاقتصاد الحديث.',
          fr: 'Devenir la plateforme d\'apprentissage en ligne leader dans la région, reconnue pour son éducation de qualité, ses certifications vérifiées et ses excellentes expériences d\'apprentissage. Nous envisageons un monde où chacun, partout, peut accéder à une éducation de classe mondiale et développer les compétences nécessaires pour réussir dans l\'économie moderne.',
        },
        features: [
          {
            icon: 'School',
            title: 'Quality Education',
            description: 'We provide world-class courses from expert trainers across multiple disciplines and industries.',
          },
          {
            icon: 'Verified',
            title: 'Verified Certificates',
            description: 'Earn verified certificates upon course completion with unique IDs and QR codes for authentication.',
          },
          {
            icon: 'Language',
            title: 'Multi-Language',
            description: 'Learn in your preferred language with full support for Arabic, English, and French.',
          },
          {
            icon: 'People',
            title: 'Expert Trainers',
            description: 'Learn from verified and accredited trainers with proven industry experience and qualifications.',
          },
          {
            icon: 'TrendingUp',
            title: 'Career Growth',
            description: 'Advance your career with practical skills and industry-recognized certifications.',
          },
          {
            icon: 'Security',
            title: 'Secure Platform',
            description: 'Your data is protected with industry-standard security measures and encryption.',
          },
        ],
      },
      contactPage: {
        email: 'info@greendye-academy.com',
        phone: '+20 123 456 7890',
        address: 'Cairo, Egypt',
        officeHours: {
          en: 'Sunday - Thursday: 9:00 AM - 6:00 PM',
          ar: 'الأحد - الخميس: 9:00 صباحًا - 6:00 مساءً',
          fr: 'Dimanche - Jeudi: 9h00 - 18h00',
        },
      },
      socialMedia: {
        facebook: 'https://facebook.com/greendye-academy',
        twitter: 'https://twitter.com/greendye_academy',
        linkedin: 'https://linkedin.com/company/greendye-academy',
        instagram: 'https://instagram.com/greendye_academy',
        youtube: 'https://youtube.com/@greendye-academy',
      },
    });

    console.log('✅ Content settings initialized successfully');
    console.log('📄 Settings ID:', settings._id);
  } catch (error) {
    console.error('❌ Error initializing content settings:', error);
    throw error;
  }
};

const run = async () => {
  try {
    await connectDB();
    await initializeContentSettings();
    console.log('✅ Initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
};

// Run the script
run();
