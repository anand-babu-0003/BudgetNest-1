# BudgetNest Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root with the following content:

```env
# Firebase Configuration for BudgetNest
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCTrAk1KFpmJYqc23YfnmCDMSXsqbfxHiU
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=budgetnest-v1.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=budgetnest-v1
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=budgetnest-v1.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=577311998285
EXPO_PUBLIC_FIREBASE_APP_ID=1:577311998285:android:27c6df2b288da0df06b704
```

### 3. Firebase Setup
1. The `google-services.json` file is already included
2. Make sure Firebase Authentication is enabled in your Firebase console
3. Enable Firestore Database
4. Enable Firebase Storage
5. Update Firestore security rules with the content from `firestore.rules.txt`

### 4. Start Development
```bash
# Start Expo development server
npm run dev

# Or start with specific platform
npm run android
npm run ios
npm run web
```

## 📱 Testing the App

1. **Authentication**: Test sign up and sign in functionality
2. **Categories**: Create and manage transaction categories
3. **Accounts**: Add and manage financial accounts
4. **Transactions**: Add transactions with categories and receipts
5. **Budgets**: Set up and track budgets
6. **Goals**: Create and monitor financial goals
7. **Reports**: View financial analytics and charts
8. **Settings**: Test theme switching and data export

## 🔧 Firebase Console Setup

### Authentication
1. Go to Firebase Console > Authentication
2. Enable Email/Password provider
3. Configure any additional providers if needed

### Firestore Database
1. Go to Firebase Console > Firestore Database
2. Create database in production mode
3. Copy security rules from `firestore.rules.txt`

### Storage
1. Go to Firebase Console > Storage
2. Create storage bucket
3. Configure security rules for receipt uploads

## 🏗️ Building for Production

### Android
```bash
# Install EAS CLI
npm install -g @expo/eas-cli
eas login

# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS
```bash
# Build for iOS
eas build --platform ios --profile production
```

## 🔐 Security Notes

- Never commit the `.env` file to version control
- The `google-services.json` file is included for development but should be secured in production
- All Firebase security rules are configured for user data isolation
- Environment variables are used for sensitive configuration

## 📋 Features Implemented

✅ **Complete CRUD Operations** for all data types
✅ **Advanced Filtering & Search** capabilities  
✅ **Receipt Management** with image upload
✅ **Data Export/Import** functionality
✅ **Dark Mode** theme support
✅ **Comprehensive Validation** and error handling
✅ **Professional UI/UX** with consistent design
✅ **Real-time Data Sync** with Firebase
✅ **Secure Authentication** and data protection

## 🆘 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Verify environment variables are set correctly
   - Check Firebase project configuration
   - Ensure internet connectivity

2. **Build Issues**
   - Clear Expo cache: `expo start -c`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check EAS CLI version: `eas --version`

3. **Authentication Issues**
   - Verify Firebase Auth is enabled
   - Check security rules
   - Test with different email addresses

### Getting Help

- Check the Firebase Console for error logs
- Review Expo documentation for build issues
- Check React Native Firebase documentation for integration issues

## 🎉 Ready to Go!

Your BudgetNest app is now fully configured and ready for development and production deployment!
