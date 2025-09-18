# FinanceMate - Personal Finance Management App

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

1. Create a new Firebase project at https://console.firebase.google.com/
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Enable Storage for receipt uploads
5. Copy your Firebase configuration and create a `.env` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

## Firestore Security Rules

Copy the contents of `firestore.rules.txt` to your Firebase Console > Firestore Database > Rules.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
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

## Features in Development

- Google Sign-In integration
- Advanced transaction filtering
- Recurring transaction templates  
- Data export/import functionality
- Push notifications for budget alerts
- Dark mode support
- Multi-currency support

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.