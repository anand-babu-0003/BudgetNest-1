# Firestore Security Rules Setup Guide

## Overview
This guide will help you set up the Firestore security rules for your BudgetNest application to ensure proper data security and access control.

## Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `budgetnest-v1`
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

## Step 2: Replace the Default Rules
Replace the existing rules with the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own accounts
    match /accounts/{accountId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
    
    // Users can only access their own categories
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
    
    // Users can only access their own transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
    
    // Users can only access their own budgets
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
    
    // Users can only access their own goals
    match /goals/{goalId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
  }
}
```

## Step 3: Publish the Rules
1. Click **Publish** to apply the new rules
2. Wait for the confirmation that the rules have been published

## Step 4: Test the Rules (Optional)
You can test the rules using the Firebase Console Rules Playground:
1. Click on **Rules playground** tab
2. Select a collection (e.g., `users`)
3. Set up test scenarios to verify the rules work correctly

## Security Features Explained

### Authentication Required
- All operations require `request.auth != null` (user must be authenticated)

### Data Ownership
- Users can only access data where `user_id` matches their `auth.uid`
- This ensures complete data isolation between users

### Collection-Specific Rules
- **users**: Users can only access their own user document
- **accounts**: Users can only access accounts they created
- **categories**: Users can only access categories they created
- **transactions**: Users can only access transactions they created
- **budgets**: Users can only access budgets they created
- **goals**: Users can only access goals they created

### Create vs Read/Write
- **Create operations**: Check `request.resource.data.user_id` (data being created)
- **Read/Write operations**: Check `resource.data.user_id` (existing data)

## Testing Your App

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test on Different Platforms

#### Web (Recommended for testing)
- Open your browser and go to the URL shown in the terminal
- Test all authentication and data operations

#### Android (if you have Android SDK set up)
```bash
npm run android
```

#### iOS (if you have Xcode set up)
```bash
npm run ios
```

### 3. Test Firebase Integration
1. **Sign Up**: Create a new account
2. **Sign In**: Test existing account login
3. **Add Data**: Create accounts, categories, transactions, budgets, and goals
4. **View Data**: Verify data appears correctly
5. **Edit/Delete**: Test CRUD operations
6. **Data Isolation**: Create multiple accounts and verify data separation

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check if Firestore rules are properly published
   - Verify user is authenticated
   - Ensure `user_id` field is set correctly in documents

2. **Authentication Issues**
   - Check Firebase Auth configuration
   - Verify API keys in environment variables
   - Test with Firebase Console Auth section

3. **Data Not Loading**
   - Check browser/device console for errors
   - Verify Firestore rules allow the operation
   - Check network connectivity

### Debug Mode
To enable debug logging, add this to your app:
```javascript
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

if (__DEV__) {
  // Enable debug mode
  console.log('Firebase Debug Mode Enabled');
}
```

## Next Steps

After setting up the security rules:

1. **Test the complete app flow**
2. **Create sample data** for testing
3. **Test data export/import** functionality
4. **Verify dark mode** persistence
5. **Test receipt upload** functionality
6. **Test filtering and search** features

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Always validate data** on the server side
3. **Use environment variables** for sensitive configuration
4. **Regularly review** and update security rules
5. **Monitor** Firebase usage and access patterns
6. **Test** security rules thoroughly before production

## Support

If you encounter any issues:
1. Check the Firebase Console for error logs
2. Review the browser/device console for client-side errors
3. Verify all configuration files are correct
4. Test with a fresh user account

Your BudgetNest app is now ready for secure, multi-user operation! 🎉
