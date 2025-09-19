// Simple Firebase connection test
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCTrAk1KFpmJYqc23YfnmCDMSXsqbfxHiU",
  authDomain: "budgetnest-v1.firebaseapp.com",
  projectId: "budgetnest-v1",
  storageBucket: "budgetnest-v1.firebasestorage.app",
  messagingSenderId: "577311998285",
  appId: "1:577311998285:android:27c6df2b288da0df06b704",
};

console.log('Testing Firebase connection...');

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  console.log('✅ Firebase initialized successfully!');
  console.log('✅ Auth service connected');
  console.log('✅ Firestore service connected');
  console.log('✅ Project ID:', firebaseConfig.projectId);
  console.log('✅ Auth Domain:', firebaseConfig.authDomain);
} catch (error) {
  console.error('❌ Firebase connection failed:', error.message);
}


