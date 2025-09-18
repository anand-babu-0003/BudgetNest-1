import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView 
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase.config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Account, Transaction } from '@/types';
import { X, Camera, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function AddTransactionScreen() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [note, setNote] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    if (!user) return;

    try {
      const accountsQuery = query(
        collection(db, 'accounts'),
        where('user_id', '==', user.id)
      );
      
      const snapshot = await getDocs(accountsQuery);
      const accountsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Account));
      
      setAccounts(accountsList);
      if (accountsList.length > 0) {
        setSelectedAccount(accountsList[0].id);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user || !amount || !selectedAccount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const newTransaction: Omit<Transaction, 'id'> = {
        user_id: user.id,
        account_id: selectedAccount,
        category_id: 'general', // Would normally select from categories
        amount: numericAmount,
        type,
        date: new Date(),
        note: note.trim() || undefined,
      };

      await addDoc(collection(db, 'transactions'), newTransaction);
      
      Alert.alert(
        'Success', 
        'Transaction added successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  if (accounts.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>No accounts found</Text>
        <Text style={styles.emptySubtext}>
          Please create an account first before adding transactions
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Transaction</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Check size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[
              styles.typeButton, 
              type === 'income' && styles.incomeSelected
            ]}
            onPress={() => setType('income')}
          >
            <Text style={[
              styles.typeText,
              type === 'income' && styles.selectedTypeText
            ]}>
              Income
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.typeButton, 
              type === 'expense' && styles.expenseSelected
            ]}
            onPress={() => setType('expense')}
          >
            <Text style={[
              styles.typeText,
              type === 'expense' && styles.selectedTypeText
            ]}>
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountField}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              autoFocus
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Account</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedAccount}
              onValueChange={setSelectedAccount}
              style={styles.picker}
            >
              {accounts.map((account) => (
                <Picker.Item 
                  key={account.id} 
                  label={account.name} 
                  value={account.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.receiptButton}>
          <Camera size={20} color="#6b7280" />
          <Text style={styles.receiptText}>Add Receipt</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  form: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  incomeSelected: {
    backgroundColor: '#10b981',
  },
  expenseSelected: {
    backgroundColor: '#ef4444',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedTypeText: {
    color: 'white',
  },
  amountSection: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  amountField: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 100,
    textAlign: 'center',
  },
  field: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  picker: {
    height: 50,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  receiptButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  receiptText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});