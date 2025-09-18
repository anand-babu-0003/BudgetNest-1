import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase.config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Account } from '@/types';
import { Plus, Wallet, CreditCard, PiggyBank, TrendingUp } from 'lucide-react-native';

export default function AccountsScreen() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

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
        ...doc.data(),
        created_at: doc.data().created_at.toDate()
      } as Account));
      
      setAccounts(accountsList);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDefaultAccount = async () => {
    if (!user) return;

    try {
      const newAccount: Omit<Account, 'id'> = {
        user_id: user.id,
        name: 'Cash',
        type: 'cash',
        balance: 0,
        created_at: new Date(),
      };

      await addDoc(collection(db, 'accounts'), newAccount);
      loadAccounts();
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    }
  };

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'cash':
        return <Wallet size={24} color="#10b981" />;
      case 'bank':
        return <CreditCard size={24} color="#3b82f6" />;
      case 'credit_card':
        return <CreditCard size={24} color="#ef4444" />;
      case 'savings':
        return <PiggyBank size={24} color="#f59e0b" />;
      case 'investment':
        return <TrendingUp size={24} color="#8b5cf6" />;
      default:
        return <Wallet size={24} color="#6b7280" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  const renderAccount = ({ item }: { item: Account }) => (
    <View style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <View style={styles.accountIcon}>
          {getAccountIcon(item.type)}
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{item.name}</Text>
          <Text style={styles.accountType}>{item.type.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      <Text style={[
        styles.accountBalance,
        item.balance < 0 ? styles.negativeBalance : styles.positiveBalance
      ]}>
        {formatCurrency(item.balance)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading accounts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accounts</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addDefaultAccount}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Balance</Text>
        <Text style={[
          styles.totalAmount,
          getTotalBalance() < 0 ? styles.negativeBalance : styles.positiveBalance
        ]}>
          {formatCurrency(getTotalBalance())}
        </Text>
        <Text style={styles.totalSubtext}>
          Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <Wallet size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No accounts yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first account to start managing your finances
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={addDefaultAccount}
          >
            <Plus size={20} color="white" />
            <Text style={styles.emptyButtonText}>Add Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  positiveBalance: {
    color: '#10b981',
  },
  negativeBalance: {
    color: '#ef4444',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  accountCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#6b7280',
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});