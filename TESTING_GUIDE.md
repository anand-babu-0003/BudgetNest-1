# BudgetNest Testing Guide

## Quick Start Testing

### 1. Start the App
```bash
npm run dev
```

### 2. Access the App
- **Web**: Open the URL shown in terminal (usually `http://localhost:8081`)
- **Mobile**: Use Expo Go app to scan the QR code

## Test Scenarios

### Authentication Flow
1. **Sign Up**
   - Create a new account with email/password
   - Verify account creation in Firebase Console
   - Check if user is redirected to dashboard

2. **Sign In**
   - Sign in with existing credentials
   - Verify successful authentication
   - Check if user data loads correctly

3. **Sign Out**
   - Sign out from the app
   - Verify redirect to sign-in screen

### Data Management

#### Categories
1. **Add Category**
   - Go to Categories tab
   - Tap "Add Category"
   - Fill in name, type, icon, color
   - Save and verify it appears in the list

2. **Edit Category**
   - Tap edit button on existing category
   - Modify details
   - Save and verify changes

3. **Delete Category**
   - Tap delete button
   - Confirm deletion
   - Verify category is removed

#### Accounts
1. **Add Account**
   - Go to Accounts tab
   - Tap "Add Account"
   - Fill in name, type, balance
   - Save and verify it appears

2. **Edit/Delete Account**
   - Test edit and delete functionality
   - Verify changes persist

#### Transactions
1. **Add Transaction**
   - Tap the + button on dashboard
   - Fill in transaction details
   - Select category and account
   - Add receipt (optional)
   - Save and verify it appears

2. **Filter Transactions**
   - Go to Transactions tab
   - Use search bar
   - Apply filters (type, category, account)
   - Clear filters and verify

#### Budgets
1. **Create Budget**
   - Go to Budgets tab
   - Tap "Create Budget"
   - Select category and set amount
   - Save and verify it appears

2. **Edit/Delete Budget**
   - Test edit and delete functionality
   - Verify progress calculations

#### Goals
1. **Create Goal**
   - Go to Goals tab
   - Tap "Create Goal"
   - Set target amount and date
   - Save and verify it appears

2. **Edit/Delete Goal**
   - Test edit and delete functionality
   - Verify progress calculations

### Theme Testing
1. **Dark Mode Toggle**
   - Go to Settings tab
   - Toggle dark mode
   - Verify theme changes across all screens
   - Restart app and verify theme persists

### Data Export
1. **Export Data**
   - Go to Settings tab
   - Tap "Export Data"
   - Choose CSV or JSON format
   - Verify file is generated and shareable

### Receipt Upload
1. **Add Receipt to Transaction**
   - When adding a transaction
   - Tap "Add Receipt"
   - Select image from gallery
   - Verify upload completes
   - Check if receipt URL is saved

## Expected Behavior

### Dashboard
- Shows user greeting
- Displays recent transactions
- Shows account balances
- Shows budget progress
- Shows goal progress

### Navigation
- All tabs should be accessible
- Smooth transitions between screens
- Proper back navigation

### Data Persistence
- All data should persist after app restart
- Changes should sync across devices (if same account)
- No data loss during operations

### Error Handling
- Network errors should show appropriate messages
- Invalid inputs should show validation errors
- Loading states should be visible during operations

## Common Issues & Solutions

### Firebase Connection Issues
- Check if `google-services.json` is in root directory
- Verify environment variables are set
- Check Firebase Console for project status

### Authentication Issues
- Clear app data and try again
- Check Firebase Auth settings
- Verify email/password format

### Data Not Loading
- Check Firestore security rules
- Verify user is authenticated
- Check browser console for errors

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Expo cache: `expo start -c`
- Check for missing dependencies

## Performance Testing

### Load Testing
1. Add 100+ transactions
2. Create multiple accounts, budgets, goals
3. Test filtering and search performance
4. Verify app remains responsive

### Memory Testing
1. Use app for extended period
2. Navigate between screens frequently
3. Add/delete data repeatedly
4. Check for memory leaks

## Security Testing

### Data Isolation
1. Create multiple user accounts
2. Verify users can only see their own data
3. Test that data doesn't leak between accounts

### Authentication Security
1. Test with invalid credentials
2. Verify proper error messages
3. Test session persistence
4. Test sign-out functionality

## Browser Compatibility

### Web Testing
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Mobile Testing
- Android (Expo Go)
- iOS (Expo Go)
- Physical devices (recommended)

## Reporting Issues

When reporting issues, include:
1. **Platform**: Web/Android/iOS
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Error messages** (if any)
6. **Screenshots** (if applicable)

## Success Criteria

The app is working correctly if:
- ✅ All authentication flows work
- ✅ All CRUD operations work
- ✅ Data persists across sessions
- ✅ Theme switching works
- ✅ Data export works
- ✅ Receipt upload works
- ✅ Filtering and search work
- ✅ No data leaks between users
- ✅ App performs well with large datasets
- ✅ Error handling is appropriate

## Next Steps After Testing

1. **Fix any issues** found during testing
2. **Optimize performance** if needed
3. **Add more test data** for realistic usage
4. **Prepare for production** deployment
5. **Set up monitoring** and analytics

Happy testing! 🧪✨


