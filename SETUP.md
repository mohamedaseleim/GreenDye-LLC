# GreenDye Academy - Quick Setup Guide

This guide will help you get the GreenDye Academy platform up and running quickly.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** (comes with Node.js)

## 🚀 Quick Start (Development)

### 1. Clone the Repository

```bash
git clone https://github.com/mohamedaseleim/GreenDye.git
cd GreenDye
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment

```bash
# Copy environment example file
cd ../backend
cp .env.example .env
```

Edit the `.env` file with your settings:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/greendye
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:3000
```

### 4. Start MongoDB

```bash
# On macOS/Linux
sudo systemctl start mongod

# On Windows
net start MongoDB

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health
- API Documentation: http://localhost:5000/api/docs

## 🐳 Quick Start (Docker)

If you prefer using Docker:

```bash
# Make sure Docker and Docker Compose are installed
docker --version
docker-compose --version

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application at http://localhost (port 80)

## 👤 Create Your First Admin User

Once the application is running:

1. Register a new account at http://localhost:3000/register
2. Open MongoDB:
   ```bash
   mongo greendye
   ```
3. Update user role to admin:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## 📚 Next Steps

### Create Sample Content

1. **Login as Admin**
2. **Create a Trainer Profile**
3. **Create Your First Course**
4. **Add Lessons to the Course**
5. **Create Quizzes**
6. **Test Certificate Generation**

### Test Features

- ✅ User registration and login
- ✅ Browse courses
- ✅ Enroll in a course
- ✅ Complete lessons
- ✅ Take quizzes
- ✅ Get certificates
- ✅ Verify certificates
- ✅ Verify trainers
- ✅ Multi-language switching

## 🔧 Common Issues and Solutions

### MongoDB Connection Error

**Problem:** Cannot connect to MongoDB
**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Or check Docker container
docker ps | grep mongo
```

### Port Already in Use

**Problem:** Port 3000 or 5000 already in use
**Solution:**
```bash
# Find and kill the process
# On macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found

**Problem:** Missing dependencies
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

**Problem:** CORS errors in browser console
**Solution:** Check that `FRONTEND_URL` in backend `.env` matches your frontend URL

## 🌐 Environment Variables Reference

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/greendye

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email (Optional - for email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@greendye-academy.com
FROM_NAME=GreenDye Academy

# File Upload
MAX_FILE_SIZE=10485760
FILE_UPLOAD_PATH=./uploads

# Frontend
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📦 Project Structure

```
GreenDye/
├── backend/                # Backend API (Node.js/Express)
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── server.js         # Entry point
│
├── frontend/             # Frontend (React)
│   ├── public/          # Static files
│   └── src/             # Source code
│       ├── components/  # Reusable components
│       ├── contexts/    # React contexts
│       ├── pages/       # Page components
│       └── App.js       # Main app component
│
├── docs/                # Documentation
├── deployment/          # Deployment configs
├── mobile-app/          # Mobile app info
└── docker-compose.yml   # Docker configuration
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📖 Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Features List](docs/FEATURES.md)
- [Mobile App](mobile-app/README.md)

## 🤝 Getting Help

- **GitHub Issues:** [Create an issue](https://github.com/mohamedaseleim/GreenDye/issues)
- **Email:** support@greendye-academy.com
- **Documentation:** Check the `docs/` folder

## 🎯 Development Tips

1. **Use nodemon for backend:** Already configured with `npm run dev`
2. **React DevTools:** Install browser extension for debugging
3. **MongoDB Compass:** Use for database visualization
4. **Postman/Insomnia:** Test API endpoints
5. **Chrome DevTools:** Debug frontend and PWA features

## 🔒 Security Notes for Development

- Never commit the `.env` file
- Change all default secrets before production
- Use strong passwords for admin accounts
- Keep dependencies updated
- Review security best practices

## 🚢 Production Deployment

For production deployment:
- **VPS/Cloud Server**: See our comprehensive [VPS Installation Guide](docs/VPS_INSTALLATION.md) ⭐ Recommended
- **Docker/Hestia Panel**: See the [Deployment Guide](docs/DEPLOYMENT.md)

Quick production checklist:
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure proper database credentials
- [ ] Set up SSL/TLS certificates
- [ ] Configure email service
- [ ] Set up file storage (AWS S3 or similar)
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Set up domain and DNS

## 📊 Default Test Data

You can create test data manually or use MongoDB scripts:

```javascript
// Create test student
db.users.insertOne({
  name: "Test Student",
  email: "student@test.com",
  password: "$2a$10$hashedpassword", // Use actual hashed password
  role: "student",
  language: "en",
  isVerified: true,
  isActive: true
})

// Create test course
db.courses.insertOne({
  title: {
    en: "Introduction to Web Development",
    ar: "مقدمة في تطوير الويب",
    fr: "Introduction au développement Web"
  },
  // ... other fields
})
```

## ✅ Verification Checklist

After setup, verify these features work:

- [ ] User registration
- [ ] User login
- [ ] Course listing
- [ ] Course detail view
- [ ] Course enrollment
- [ ] Language switching (EN/AR/FR)
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] Frontend-backend communication
- [ ] PWA installation prompt

## 🎉 Success!

If you've completed all steps, your GreenDye Academy platform is now running!

Start creating courses and transforming education! 🚀📚

---

**Need more help?** Check the documentation in the `docs/` folder or create an issue on GitHub.
