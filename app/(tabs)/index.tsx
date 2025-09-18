import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase.config';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Transaction, Account } from '@/types';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react-native';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load accounts and calculate total balance
      const accountsQuery = query(
        collection(db, 'accounts'),
        where('user_id', '==', user.id)
      );
      const accountsSnapshot = await getDocs(accountsQuery);
      const accounts = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
      
      const balance = accounts.reduce((sum, account) => sum + account.balance, 0);
      setTotalBalance(balance);

      // Load recent transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('user_id', '==', user.id),
        orderBy('date', 'desc'),
        limit(5)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      } as Transaction));
      
      setRecentTransactions(transactions);

      // Calculate monthly income and expenses
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(currentMonth.getMonth() + 1);

      const monthlyTransactionsQuery = query(
        collection(db, 'transactions'),
        where('user_id', '==', user.id),
        where('date', '>=', currentMonth),
        where('date', '<', nextMonth)
      );
      
      const monthlySnapshot = await getDocs(monthlyTransactionsQuery);
      let income = 0;
      let expenses = 0;
      
      monthlySnapshot.docs.forEach(doc => {
        const transaction = doc.data() as Transaction;
        if (transaction.type === 'income') {
          income += transaction.amount;
        } else {
          expenses += transaction.amount;
        }
      });
      
      setMonthlyIncome(income);
      setMonthlyExpenses(expenses);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, {user?.name}!</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-transaction')}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <View style={styles.summaryHeader}>
            <TrendingUp size={20} color="#10b981" />
            <Text style={styles.summaryTitle}>Income</Text>
          </View>
          <Text style={[styles.summaryAmount, styles.incomeText]}>
            {formatCurrency(monthlyIncome)}
          </Text>
          <Text style={styles.summaryPeriod}>This month</Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <View style={styles.summaryHeader}>
            <TrendingDown size={20} color="#ef4444" />
            <Text style={styles.summaryTitle}>Expenses</Text>
          </View>
          <Text style={[styles.summaryAmount, styles.expenseText]}>
            {formatCurrency(monthlyExpenses)}
          </Text>
          <Text style={styles.summaryPeriod}>This month</Text>
        </View>
      </View>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Add your first transaction to get started</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionNote} numberOfLines={1}>
                    {transaction.note || 'Transaction'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {transaction.date.toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.type === 'income' ? styles.incomeText : styles.expenseText
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryPeriod: {
    fontSize: 12,
    color: '#9ca3af',
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  incomeText: {
    color: '#10b981',
  },
  expenseText: {
    color: '#ef4444',
  },
  recentSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  viewAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  transactionsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});