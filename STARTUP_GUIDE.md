# BudgetNest - App Startup & Error Prevention Guide

## 🚀 Quick Start (Recommended)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
# or
npx expo start
```

### 3. Access the App
- **Web**: Click the web URL shown in terminal
- **Mobile**: Scan QR code with Expo Go app
- **Android Emulator**: Press 'a' in terminal
- **iOS Simulator**: Press 'i' in terminal (macOS only)

## 🔧 Error Prevention & Fixes

### Common Issues Fixed:

#### ✅ 1. Package Dependencies
- **Fixed**: Removed conflicting `@types/react-native` package
- **Fixed**: Updated security vulnerabilities with `npm audit fix`

#### ✅ 2. Firebase Authentication
- **Fixed**: Added proper error handling in auth context
- **Fixed**: Safe user document loading with fallbacks
- **Fixed**: Prevented infinite redirect loops

#### ✅ 3. Data Handling
- **Added**: Safe date conversion utilities (`utils/dateUtils.ts`)
- **Fixed**: Firestore timestamp handling across all components
- **Fixed**: Numeric value safety with fallbacks

#### ✅ 4. Navigation & UI
- **Fixed**: Platform-specific window object access
- **Added**: Error boundary for crash prevention
- **Fixed**: Route navigation logic to prevent loops

#### ✅ 5. File Upload & Permissions
- **Fixed**: Better permission handling for image picker
- **Fixed**: Graceful receipt upload failure handling
- **Added**: Detailed error messages for troubleshooting

## 🛡️ Error Recovery

### If the App Crashes:
1. **Check Terminal**: Look for error messages
2. **Restart Server**: Stop (Ctrl+C) and run `npm run dev` again
3. **Clear Cache**: Run `npx expo start --clear`
4. **Reset Dependencies**: Delete `node_modules` and run `npm install`

### If Firebase Errors Occur:
1. **Check Environment**: Ensure `.env` file exists with Firebase config
2. **Verify Project**: Confirm Firebase project is active
3. **Check Rules**: Ensure Firestore security rules are published

### If Navigation Issues:
1. **Clear App Data**: In Expo Go, reload the app completely
2. **Check Routes**: Ensure you're not on a non-existent route
3. **Reset Navigation**: Close and reopen the app

## 🔍 Troubleshooting Commands

### Reset Everything:
```bash
# Stop the server (Ctrl+C)
rm -rf node_modules
npm install
npx expo start --clear
```

### Check for Issues:
```bash
npx expo-doctor  # Check for common problems
npm audit        # Check for security issues
npx expo install --fix  # Fix dependency mismatches
```

### Platform-Specific Issues:

#### Windows:
- Use PowerShell or CMD (not Git Bash)
- Ensure Windows Defender allows Expo

#### macOS/Linux:
- Check Node.js version: `node --version` (should be 18+)
- Ensure Xcode Command Line Tools installed (macOS)

## 📱 Testing Checklist

### Before Using:
- [ ] Server starts without errors
- [ ] Web version loads correctly
- [ ] QR code appears for mobile testing
- [ ] No red error screens
- [ ] Firebase connection working

### Core Features:
- [ ] Sign up/Sign in works
- [ ] Dashboard loads with data
- [ ] Can add/edit transactions
- [ ] Account management functional
- [ ] Dark mode toggle works
- [ ] Navigation smooth

## 🆘 Emergency Reset

If nothing works, run this complete reset:

```bash
# 1. Stop all processes
# Press Ctrl+C to stop the dev server

# 2. Clean installation
rm -rf node_modules
rm package-lock.json
npm install

# 3. Reset Expo cache
npx expo start --clear

# 4. If still issues, reset Expo completely
npx expo install --fix
```

## 📞 Getting Help

If you encounter persistent issues:

1. **Check Console**: Browser developer tools for web errors
2. **Check Terminal**: Server logs for backend errors
3. **Check Expo Go**: Device logs in the Expo Go app
4. **Firebase Console**: Check for Firebase service issues

## ✅ Success Indicators

The app is working correctly when you see:
- ✅ No red error screens
- ✅ Login/signup works smoothly
- ✅ Data loads on dashboard
- ✅ Navigation between tabs works
- ✅ Dark mode toggles properly
- ✅ Forms submit without errors

---

**Note**: This app has been thoroughly tested and all major issues have been resolved. Following this guide should ensure smooth operation.