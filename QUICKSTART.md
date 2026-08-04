# GreenDye Academy - Quick Start Guide

Get up and running with GreenDye Academy in minutes!

## 🚀 Quick Setup (5 minutes)

### Prerequisites

- Node.js 16+ installed
- MongoDB installed and running
- Git installed

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/mohamedaseleim/GreenDye.git
cd GreenDye

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# In backend directory
cd backend
cp .env.example .env
```

Edit `.env` with your settings (minimum required):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/greendye
JWT_SECRET=your-random-secret-key-change-this
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB

```bash
# If using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or start your local MongoDB service
sudo systemctl start mongod
```

### 4. Start the Application

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

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs

## 🎯 Quick Test

### Create an Admin Account

```bash
# In backend directory
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  await User.create({
    name: 'Admin User',
    email: 'admin@greendye.com',
    password: hashedPassword,
    role: 'admin'
  });
  
  console.log('✓ Admin user created: admin@greendye.com / admin123');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
"
```

### Or Use Seed Data

```bash
cd backend
node seed.js
```

This creates sample accounts:
- Admin: `admin@greendye.com` / `admin123`
- Trainer: `trainer@greendye.com` / `trainer123`
- Student: `student@greendye.com` / `student123`

## 📦 Using Docker (Alternative)

```bash
# Start all services with Docker
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Testing the API

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Using Postman

1. Import the API collection (coming soon)
2. Set base URL: `http://localhost:5000/api`
3. Test endpoints

## 🔧 Common Issues

### MongoDB Connection Error

```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Or
sudo systemctl status mongod
```

### Port Already in Use

```bash
# Kill process on port 5000
sudo lsof -ti:5000 | xargs kill -9

# Or use different port in .env
PORT=5001
```

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Explore the Platform**
   - Login with admin credentials
   - Create a course
   - Enroll as a student
   - Test payment system (use test mode)

2. **Review Documentation**
   - [README.md](README.md) - Overview
   - [API_REFERENCE.md](docs/API_REFERENCE.md) - API docs
   - [USER_GUIDE.md](docs/USER_GUIDE.md) - User guide
   - [PAYMENT_INTEGRATION.md](docs/PAYMENT_INTEGRATION.md) - Payments

3. **Configure Features**
   - Set up payment gateways (see [PAYMENT_INTEGRATION.md](docs/PAYMENT_INTEGRATION.md))
   - Configure SMTP for emails
   - Set up SSL for production
   - Configure domain

4. **Development**
   - Check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
   - Read [CHANGELOG.md](CHANGELOG.md) for updates
   - Join our community

## 🎓 Learning Resources

### Backend API
- Express.js: https://expressjs.com
- MongoDB: https://www.mongodb.com/docs
- Mongoose: https://mongoosejs.com

### Frontend
- React: https://react.dev
- Material-UI: https://mui.com
- i18next: https://www.i18next.com

## 💡 Pro Tips

1. **Development Workflow**
   ```bash
   # Use nodemon for auto-restart
   cd backend
   npm run dev
   
   # Frontend with hot reload
   cd frontend
   npm start
   ```

2. **Database Management**
   ```bash
   # Connect to MongoDB
   mongosh greendye
   
   # View collections
   show collections
   
   # Clear all data
   db.dropDatabase()
   ```

3. **Environment Management**
   - Never commit `.env` file
   - Use `.env.example` as template
   - Different `.env` for different environments

4. **Debugging**
   ```bash
   # Backend logs
   npm run dev
   
   # Check API health
   curl http://localhost:5000/api/health
   ```

## 🐛 Troubleshooting

### Backend won't start
1. Check MongoDB is running
2. Verify `.env` configuration
3. Check port availability
4. Review error messages

### Frontend won't load
1. Check backend is running
2. Verify proxy in `package.json`
3. Clear browser cache
4. Check console for errors

### Payment not working
1. Verify payment gateway credentials
2. Check webhook URLs
3. Use test mode for development
4. Review payment logs

## 📞 Support

- **Issues**: https://github.com/mohamedaseleim/GreenDye/issues
- **Email**: support@greendye-academy.com
- **Docs**: [docs/](docs/)

## ✅ Checklist

Before starting development:
- [ ] Node.js installed
- [ ] MongoDB installed and running
- [ ] Dependencies installed
- [ ] `.env` configured
- [ ] Backend running
- [ ] Frontend running
- [ ] Can access localhost:3000
- [ ] Can login with test account
- [ ] Read documentation

Happy coding! 🚀
