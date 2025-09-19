import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/app/_layout';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Transaction, Account } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ModernHeader, FloatingActionButton } from '@/components/ModernHeader';
import { ModernCard, CardHeader, CardContent } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { safeToDate, safeToNumber } from '@/utils/dateUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors, typography, spacing, shadows, isDark } = useTheme();
  const { openNavigation } = useNavigation();
  const insets = useSafeAreaInsets();
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      // Load accounts
      const accountsQuery = query(
        collection(db, 'accounts'),
        where('user_id', '==', user.id)
      );
      const accountsSnapshot = await getDocs(accountsQuery);
      const accountsData = accountsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          balance: safeToNumber(data.balance, 0),
          created_at: safeToDate(data.created_at)
        };
      }) as Account[];
      setAccounts(accountsData);

      // Calculate total balance
      const balance = accountsData.reduce((sum, account) => sum + safeToNumber(account.balance, 0), 0);
      setTotalBalance(balance);

      // Load recent transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('user_id', '==', user.id),
        orderBy('date', 'desc'),
        limit(5)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsData = transactionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: safeToDate(data.date),
          amount: safeToNumber(data.amount, 0)
        };
      }) as Transaction[];
      setRecentTransactions(transactionsData);

      // Calculate monthly income and expenses
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const monthlyTransactionsQuery = query(
        collection(db, 'transactions'),
        where('user_id', '==', user.id),
        where('date', '>=', startOfMonth)
      );
      const monthlySnapshot = await getDocs(monthlyTransactionsQuery);
      
      let income = 0;
      let expenses = 0;
      monthlySnapshot.docs.forEach(doc => {
        const transaction = doc.data() as Transaction;
        const amount = safeToNumber(transaction.amount, 0);
        if (transaction.type === 'income') {
          income += amount;
        } else {
          expenses += amount;
        }
      });
      
      setMonthlyIncome(income);
      setMonthlyExpenses(expenses);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'Add Transaction',
      icon: 'add-circle' as keyof typeof Ionicons.glyphMap,
      color: colors.primary,
      onPress: () => router.push('/add-transaction'),
    },
    {
      title: 'Accounts',
      icon: 'wallet' as keyof typeof Ionicons.glyphMap,
      color: colors.secondary,
      onPress: () => router.push('/(tabs)/accounts'),
    },
    {
      title: 'Budget',
      icon: 'pie-chart' as keyof typeof Ionicons.glyphMap,
      color: colors.financial.budget,
      onPress: () => router.push('/(tabs)/budgets'),
    },
    {
      title: 'Reports',
      icon: 'analytics' as keyof typeof Ionicons.glyphMap,
      color: colors.accent,
      onPress: () => router.push('/(tabs)/reports'),
    },
  ];

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#ffffff', // Pure white background
      paddingBottom: insets.bottom + 85,
    }}>
      <ModernHeader
        title={getGreeting()}
        subtitle={user?.name ? `Welcome back, ${user.name}` : 'Welcome back'}
        showMenu={true}
        onMenuPress={openNavigation}
        rightIcon="notifications-outline"
        onRightPress={() => {}}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Overview Card */}
        <ModernCard style={styles.balanceCard} shadow={true}>
          <CardHeader
            title="Total Balance"
            subtitle="Your current financial position"
          />
          <CardContent>
            <Text style={[styles.balanceAmount, isDark && styles.balanceAmountDark]}>
              {formatCurrency(totalBalance)}
            </Text>
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <Ionicons name="trending-up" size={16} color="#10b981" />
                <Text style={[styles.balanceStatText, isDark && styles.balanceStatTextDark]}>
                  {formatCurrency(monthlyIncome)} income
                </Text>
              </View>
              <View style={styles.balanceStat}>
                <Ionicons name="trending-down" size={16} color="#ef4444" />
                <Text style={[styles.balanceStatText, isDark && styles.balanceStatTextDark]}>
                  {formatCurrency(monthlyExpenses)} expenses
                </Text>
              </View>
            </View>
          </CardContent>
        </ModernCard>

        {/* Quick Actions */}
        <ModernCard style={styles.quickActionsCard}>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickAction, isDark && styles.quickActionDark]}
                  onPress={action.onPress}
                >
                  <View style={[styles.quickActionIcon, isDark && styles.quickActionIconDark]}>
                    {action.icon}
                  </View>
                  <Text style={[styles.quickActionText, isDark && styles.quickActionTextDark]}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardContent>
        </ModernCard>

        {/* Recent Transactions */}
        <ModernCard style={styles.transactionsCard}>
          <CardHeader
            title="Recent Transactions"
            action={
              <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
                <Text style={[styles.seeAllText, isDark && styles.seeAllTextDark]}>See all</Text>
              </TouchableOpacity>
            }
          />
          <CardContent>
            {recentTransactions.length > 0 ? (
              <View style={styles.transactionsList}>
                {recentTransactions.map((transaction) => (
                  <View key={transaction.id} style={[styles.transactionItem, isDark && styles.transactionItemDark]}>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.transactionNote, isDark && styles.transactionNoteDark]}>
                        {transaction.note || 'Transaction'}
                      </Text>
                      <Text style={[styles.transactionDate, isDark && styles.transactionDateDark]}>
                        {transaction.date.toLocaleDateString()}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                      ]}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
                <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                  No transactions yet
                </Text>
                <ModernButton
                  title="Add Transaction"
                  onPress={() => router.push('/add-transaction')}
                  variant="outline"
                  size="small"
                />
              </View>
            )}
          </CardContent>
        </ModernCard>

        {/* Accounts Summary */}
        <ModernCard style={styles.accountsCard}>
          <CardHeader
            title="Accounts"
            action={
              <TouchableOpacity onPress={() => router.push('/(tabs)/accounts')}>
                <Text style={[styles.seeAllText, isDark && styles.seeAllTextDark]}>Manage</Text>
              </TouchableOpacity>
            }
          />
          <CardContent>
            {accounts.length > 0 ? (
              <View style={styles.accountsList}>
                {accounts.map((account) => (
                  <View key={account.id} style={[styles.accountItem, isDark && styles.accountItemDark]}>
                    <View style={styles.accountInfo}>
                      <Text style={[styles.accountName, isDark && styles.accountNameDark]}>
                        {account.name}
                      </Text>
                      <Text style={[styles.accountType, isDark && styles.accountTypeDark]}>
                        {account.type.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.accountBalance, isDark && styles.accountBalanceDark]}>
                      {formatCurrency(account.balance)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={48} color="#9ca3af" />
                <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                  No accounts yet
                </Text>
                <ModernButton
                  title="Add Account"
                  onPress={() => router.push('/(tabs)/accounts')}
                  variant="outline"
                  size="small"
                />
              </View>
            )}
          </CardContent>
        </ModernCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700', // Bold for professional look
    color: '#0f172a', // Professional dark text
    marginBottom: 16,
  },
  balanceAmountDark: {
    color: '#0f172a', // Always dark for readability
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceStatText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  balanceStatTextDark: {
    color: '#9ca3af',
  },
  quickActionsCard: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: '#f8fafc', // Light background
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0', // Light border
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionDark: {
    backgroundColor: '#f8fafc', // Same for professional theme
    borderColor: '#e2e8f0',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIconDark: {
    backgroundColor: '#4b5563',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  quickActionTextDark: {
    color: '#d1d5db',
  },
  transactionsCard: {
    marginBottom: 20,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  seeAllTextDark: {
    color: '#60a5fa',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionItemDark: {
    borderBottomColor: '#4b5563',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  transactionNoteDark: {
    color: '#ffffff',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  transactionDateDark: {
    color: '#9ca3af',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#059669', // Professional green
  },
  expenseAmount: {
    color: '#dc2626', // Professional red
  },
  accountsCard: {
    marginBottom: 20,
  },
  accountsList: {
    gap: 12,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  accountItemDark: {
    borderBottomColor: '#4b5563',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  accountNameDark: {
    color: '#ffffff',
  },
  accountType: {
    fontSize: 14,
    color: '#6b7280',
  },
  accountTypeDark: {
    color: '#9ca3af',
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  accountBalanceDark: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyStateTextDark: {
    color: '#9ca3af',
  },
});