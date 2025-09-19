# Firebase Setup Instructions

## The app is showing authentication errors because it needs proper Firebase setup.

### Option 1: Use Your Own Firebase Project (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication and Firestore
4. Get your config from Project Settings > General > Web App
5. Update the `.env` file with your config:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Option 2: Demo Mode (Limited Functionality)

The current Firebase credentials in the app are for demonstration purposes and may not work for new users.

### Setting Up Authentication

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Add test users manually or allow registration

### Setting Up Firestore

1. Go to Firestore Database
2. Create database in test mode
3. Copy rules from `firestore.rules.txt` and paste in Rules tab

### Setting Up Storage

1. Go to Storage
2. Get started with default settings
3. Update rules if needed for receipt uploads

## Quick Test

Once Firebase is properly configured:
1. Try creating a new account
2. The app should work normally
3. All features will be functional

## Need Help?

Check the Firebase Console for any errors or contact support.