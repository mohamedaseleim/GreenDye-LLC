# Mobile App Setup Guide

## GreenDye Academy React Native Mobile App

This guide will help you set up and run the GreenDye Academy mobile application on iOS and Android devices.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the App](#running-the-app)
6. [Building for Production](#building-for-production)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

#### For All Platforms
- **Node.js** >= 16.x
- **npm** >= 8.x or **yarn** >= 1.22.x
- **Git**

#### For iOS Development (macOS only)
- **Xcode** >= 14.0
- **CocoaPods** >= 1.11.0
- macOS Monterey (12.0) or later

#### For Android Development
- **Android Studio** >= 2022.1 (Electric Eel)
- **Java Development Kit (JDK)** >= 11
- **Android SDK** (API Level 31 or higher)
- **Android SDK Build-Tools**
- **Android Emulator** or physical device

### Check Prerequisites

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Java version (for Android)
java -version

# Check Xcode version (for iOS, macOS only)
xcodebuild -version

# Check CocoaPods version (for iOS, macOS only)
pod --version
```

---

## Environment Setup

### 1. React Native CLI

Install React Native CLI globally:

```bash
npm install -g react-native-cli
```

### 2. Android Setup

#### Install Android Studio

1. Download Android Studio from https://developer.android.com/studio
2. During installation, make sure the following are selected:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device

#### Configure Android SDK

1. Open Android Studio
2. Go to **Settings** > **Appearance & Behavior** > **System Settings** > **Android SDK**
3. Install the following:
   - Android 12.0 (S) - API Level 31
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android SDK Tools

#### Set Environment Variables

Add to your `~/.bash_profile`, `~/.bashrc`, or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Reload your profile:
```bash
source ~/.bash_profile  # or ~/.bashrc or ~/.zshrc
```

### 3. iOS Setup (macOS only)

#### Install Xcode

1. Download Xcode from the Mac App Store
2. Install Command Line Tools:
   ```bash
   xcode-select --install
   ```

#### Install CocoaPods

```bash
sudo gem install cocoapods
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mohamedaseleim/GreenDye.git
cd GreenDye/mobile-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install iOS Dependencies (macOS only)

```bash
cd ios
pod install
cd ..
```

---

## Configuration

### 1. Configure API Endpoint

Edit `src/services/api.js` and update the `API_BASE_URL`:

```javascript
// For local development
const API_BASE_URL = 'http://localhost:5000/api';

// For production
const API_BASE_URL = 'https://api.greendye-academy.com/api';

// For Android emulator (use 10.0.2.2 instead of localhost)
const API_BASE_URL = 'http://10.0.2.2:5000/api';
```

### 2. App Configuration

Edit `app.json` to customize:

```json
{
  "name": "GreenDyeApp",
  "displayName": "GreenDye Academy",
  "version": "1.0.0",
  "ios": {
    "bundleIdentifier": "com.greendye.academy"
  },
  "android": {
    "package": "com.greendye.academy"
  }
}
```

---

## Running the App

### Start Metro Bundler

In the mobile-app directory:

```bash
npm start
```

Keep this terminal open.

### Run on iOS (macOS only)

In a new terminal:

```bash
npm run ios

# Or specify a device
npm run ios -- --simulator="iPhone 14"
```

### Run on Android

#### Using Emulator

1. Start Android Studio
2. Open AVD Manager
3. Start an emulator
4. In terminal:

```bash
npm run android
```

#### Using Physical Device

1. Enable Developer Options on your device
2. Enable USB Debugging
3. Connect device via USB
4. Run:

```bash
npm run android
```

---

## Building for Production

### iOS

1. Open the project in Xcode:
   ```bash
   open ios/GreenDyeApp.xcworkspace
   ```

2. Select **Product** > **Archive**

3. Follow the App Store submission process

### Android

1. Generate a release keystore:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Place the keystore in `android/app/`

3. Edit `android/gradle.properties`:
   ```properties
   MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
   MYAPP_RELEASE_KEY_ALIAS=my-key-alias
   MYAPP_RELEASE_STORE_PASSWORD=*****
   MYAPP_RELEASE_KEY_PASSWORD=*****
   ```

4. Build the release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

5. Find the APK at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

---

## Troubleshooting

### Common Issues

#### Metro Bundler Issues

```bash
# Clear cache and restart
npm start -- --reset-cache
```

#### iOS Build Fails

```bash
# Clean build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

#### Android Build Fails

```bash
# Clean build
cd android
./gradlew clean
cd ..
```

#### Port Already in Use

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

### Network Issues

If you can't connect to the backend:

1. **iOS Simulator**: Use `localhost` or `127.0.0.1`
2. **Android Emulator**: Use `10.0.2.2` instead of `localhost`
3. **Physical Device**: Use your computer's IP address

Find your IP:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

### Dependencies Issues

```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# iOS: Reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

---

## Features Available in Mobile App

### Authentication
- ✅ Login with email/password
- ✅ Register new account
- ✅ JWT token storage
- ✅ Auto-login on app restart

### Home Screen
- ✅ Personalized recommendations
- ✅ Trending courses
- ✅ User stats (points, level, badges, streak)
- ✅ AI-powered suggestions

### Courses
- ✅ Browse all courses
- ✅ Search courses
- ✅ Filter by category, level, price
- ✅ View course details
- ✅ Course ratings and reviews

### My Learning
- ✅ View enrolled courses
- ✅ Track progress
- ✅ Continue learning
- ✅ Course completion status

### Profile
- ✅ User information
- ✅ Gamification stats
- ✅ Achievements and badges
- ✅ Learning streak
- ✅ Settings
- ✅ Logout

---

## Development Tips

### Hot Reload

- Press `R` in the terminal running Metro Bundler
- Shake the device and select "Reload"
- iOS: `Cmd + R`
- Android: `R + R` (press R twice)

### Debug Menu

- iOS: `Cmd + D`
- Android: `Cmd + M` (Mac) or `Ctrl + M` (Windows/Linux)
- Physical device: Shake the device

### Debugging

1. Enable Remote JS Debugging from debug menu
2. Open Chrome DevTools at `http://localhost:8081/debugger-ui`

### Logging

```javascript
console.log('Debug message');
console.warn('Warning message');
console.error('Error message');
```

View logs:
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

---

## Next Steps

1. **Customize UI**: Modify screens in `src/screens/`
2. **Add Features**: Create new components in `src/components/`
3. **API Integration**: Update services in `src/services/`
4. **Navigation**: Modify navigation in `src/navigation/`

---

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [GreenDye Academy API Documentation](./NEW_FEATURES_API.md)
- [GitHub Repository](https://github.com/mohamedaseleim/GreenDye)

---

## Support

For issues or questions:
- Email: support@greendye-academy.com
- GitHub Issues: https://github.com/mohamedaseleim/GreenDye/issues
- Documentation: See `docs/` folder

---

**Version:** 1.2.0  
**Last Updated:** 2025-10-11
