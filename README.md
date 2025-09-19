# BudgetNest - Personal Finance Management App

A comprehensive cross-platform personal finance management app built with React Native, Expo Router, and Firebase.

## Features

### Authentication
- Firebase Auth with Email/Password authentication
- Secure user registration and login
- User profile management with currency preferences

### Core Functionality
- **Dashboard**: Overview of total balance, monthly income vs expenses, recent transactions
- **Transactions**: Complete transaction management with filtering and categorization
- **Accounts**: Multi-account support (cash, bank, credit card, savings, investment)
- **Budgets**: Category-based budget tracking with progress indicators
- **Goals**: Savings goals with target amounts and deadlines
- **Reports**: Visual charts and analytics with export capabilities
- **Settings**: Profile management, preferences, and data controls

### Technical Features
- Real-time data synchronization with Firestore
- Secure user authentication and authorization
- Image upload for receipts (Firebase Storage)
- Charts and data visualization
- Responsive mobile-first design
- Offline support with data caching

## Firebase Setup

The app is already configured with Firebase for the BudgetNest project:

- **Project ID**: budgetnest-v1
- **Package Name**: com.karthik.budgetnest
- **Storage Bucket**: budgetnest-v1.firebasestorage.app

### Environment Variables

Create a `.env` file in the project root with your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCTrAk1KFpmJYqc23YfnmCDMSXsqbfxHiU
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=budgetnest-v1.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=budgetnest-v1
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=budgetnest-v1.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=577311998285
EXPO_PUBLIC_FIREBASE_APP_ID=1:577311998285:android:27c6df2b288da0df06b704
```

## Firestore Security Rules

Copy the contents of `firestore.rules.txt` to your Firebase Console > Firestore Database > Rules.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create your environment file:
```bash
# Copy the example environment file
cp .env.example .env
# Edit .env with your Firebase configuration (already provided above)
```

3. Start the development server:
```bash
npm run dev
```

4. For Android development:
```bash
npm run android
```

5. For iOS development:
```bash
npm run ios
```

## App Structure

```
app/
├── (auth)/              # Authentication screens
│   ├── signin.tsx       # Sign in screen
│   └── signup.tsx       # Sign up screen
├── (tabs)/              # Main app tabs
│   ├── index.tsx        # Dashboard
│   ├── transactions.tsx # Transactions list
│   ├── accounts.tsx     # Account management
│   ├── budgets.tsx      # Budget tracking
│   ├── goals.tsx        # Financial goals
│   ├── reports.tsx      # Analytics and reports
│   └── settings.tsx     # App settings
├── add-transaction.tsx  # Add transaction modal
└── _layout.tsx          # Root layout with auth
```

## Database Schema

### Collections

- **users**: User profiles with currency preferences
- **accounts**: User's financial accounts
- **transactions**: All financial transactions
- **budgets**: Category-based budgets
- **goals**: Savings and financial goals
- **categories**: Custom transaction categories

### Security

- Row-level security ensures users can only access their own data
- Firebase Security Rules enforce user ownership
- All sensitive operations require authentication

## Production Build

### Android Build

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
eas login
```

2. Build for Android:
```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS Build

```bash
# Build for iOS
eas build --platform ios --profile production
```

## 🚀 Current Status

✅ **Fully Implemented Features:**
- Complete authentication system with Firebase Auth
- Full CRUD operations for all data types (accounts, categories, transactions, budgets, goals)
- Category management with custom icons and colors
- Receipt upload functionality with Firebase Storage
- Advanced transaction filtering and search
- Data export (CSV/JSON) with native sharing
- Dark mode theme switching with persistence
- Real-time data synchronization
- Comprehensive form validation and error handling
- Loading states for all operations

✅ **Firebase Integration:**
- Authentication working perfectly
- Firestore database configured
- Security rules ready for deployment
- Storage configured for receipt uploads

## 🧪 Testing

The app is ready for testing! See the comprehensive testing guide:

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Complete testing scenarios
- **[FIRESTORE_RULES_SETUP.md](./FIRESTORE_RULES_SETUP.md)** - Security rules setup

### Quick Start Testing
```bash
npm run dev
```
Then open the web URL or scan the QR code with Expo Go.

## Features in Development

- Google Sign-In integration
- Recurring transaction templates  
- Push notifications for budget alerts
- Multi-currency support

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.