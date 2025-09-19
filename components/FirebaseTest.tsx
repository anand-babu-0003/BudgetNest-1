import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const FirebaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [authStatus, setAuthStatus] = useState<string>('Testing...');

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      // Test Firestore connection
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, { 
        timestamp: new Date(),
        message: 'Firebase connection test successful' 
      });
      
      const docSnap = await getDoc(testDoc);
      if (docSnap.exists()) {
        setConnectionStatus('✅ Firestore Connected');
      } else {
        setConnectionStatus('❌ Firestore Failed');
      }
    } catch (error) {
      console.error('Firestore connection error:', error);
      setConnectionStatus('❌ Firestore Error: ' + (error as Error).message);
    }

    // Test Auth connection
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAuthStatus('✅ Auth Connected (User: ' + user.email + ')');
        } else {
          setAuthStatus('✅ Auth Connected (No user)');
        }
        unsubscribe();
      });
    } catch (error) {
      console.error('Auth connection error:', error);
      setAuthStatus('❌ Auth Error: ' + (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      <Text style={styles.status}>Firestore: {connectionStatus}</Text>
      <Text style={styles.status}>Auth: {authStatus}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    marginBottom: 5,
  },
});


