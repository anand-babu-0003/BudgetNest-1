import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/app/_layout';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Transaction, Account, Category } from '@/types';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, PieChart } from 'lucide-react-native';
import { router } from 'expo-router';
import { ModernHeader } from '@/components/ModernHeader';
import { ModernCard, CardHeader, CardContent } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { openNavigation } = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load transactions for the selected period
      const startDate = getStartDate(selectedPeriod);
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('user_id', '==', user?.id),
        where('date', '>=', startDate),
        orderBy('date', 'desc')
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsData = transactionsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate()
      })) as Transaction[];

      // Load accounts
      const accountsQuery = query(
        collection(db, 'accounts'),
        where('user_id', '==', user?.id)
      );
      const accountsSnapshot = await getDocs(accountsQuery);
      const accountsData = accountsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Account[];

      // Load categories
      const categoriesQuery = query(
        collection(db, 'categories'),
        where('user_id', '==', user?.id)
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Category[];

      setTransactions(transactionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (period: 'week' | 'month' | 'year') => {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6b7280';
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || '💰';
  };

  // Calculate analytics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Top spending categories
  const categorySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const categoryId = t.category_id;
      acc[categoryId] = (acc[categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categorySpending)
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      name: getCategoryName(categoryId),
      color: getCategoryColor(categoryId),
      icon: getCategoryIcon(categoryId),
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Recent transactions
  const recentTransactions = transactions.slice(0, 5);

  const periodOptions = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
  ];

  const renderCategoryItem = (category: any, index: number) => (
    <View key={category.categoryId} style={[styles.categoryItem, isDark && styles.categoryItemDark]}>
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
          <Text style={styles.iconText}>{category.icon}</Text>
        </View>
        <Text style={[styles.categoryName, isDark && styles.categoryNameDark]}>
          {category.name}
        </Text>
      </View>
      <Text style={[styles.categoryAmount, isDark && styles.categoryAmountDark]}>
        {formatCurrency(category.amount)}
      </Text>
    </View>
  );

  const renderTransaction = (transaction: Transaction) => (
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
  );

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <ModernHeader
          title="Reports"
          subtitle="Loading analytics..."
          onMenuPress={() => {}}
          showNotifications={false}
          showSearch={false}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
            Loading your financial data...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ModernHeader
        title="Reports"
        subtitle={`${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} analytics`}
        onMenuPress={() => {}}
        showNotifications={false}
        showSearch={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <ModernCard style={styles.periodCard}>
          <CardHeader title="Time Period" />
          <CardContent>
            <View style={styles.periodButtons}>
              {periodOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.periodButton,
                    selectedPeriod === option.key && styles.periodButtonActive,
                    isDark && styles.periodButtonDark,
                    selectedPeriod === option.key && isDark && styles.periodButtonActiveDark
                  ]}
                  onPress={() => setSelectedPeriod(option.key as any)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === option.key && styles.periodButtonTextActive,
                      isDark && styles.periodButtonTextDark,
                      selectedPeriod === option.key && isDark && styles.periodButtonTextActiveDark
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardContent>
        </ModernCard>

        {/* Financial Overview */}
        <ModernCard style={styles.overviewCard}>
          <CardHeader title="Financial Overview" />
          <CardContent>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <View style={[styles.overviewIcon, { backgroundColor: '#10b981' }]}>
                  <TrendingUp size={20} color="#ffffff" />
                </View>
                <Text style={[styles.overviewLabel, isDark && styles.overviewLabelDark]}>Income</Text>
                <Text style={[styles.overviewValue, isDark && styles.overviewValueDark]}>
                  {formatCurrency(totalIncome)}
                </Text>
              </View>
              <View style={styles.overviewItem}>
                <View style={[styles.overviewIcon, { backgroundColor: '#ef4444' }]}>
                  <TrendingDown size={20} color="#ffffff" />
                </View>
                <Text style={[styles.overviewLabel, isDark && styles.overviewLabelDark]}>Expenses</Text>
                <Text style={[styles.overviewValue, isDark && styles.overviewValueDark]}>
                  {formatCurrency(totalExpenses)}
                </Text>
              </View>
              <View style={styles.overviewItem}>
                <View style={[styles.overviewIcon, { backgroundColor: netIncome >= 0 ? '#3b82f6' : '#f59e0b' }]}>
                  <DollarSign size={20} color="#ffffff" />
                </View>
                <Text style={[styles.overviewLabel, isDark && styles.overviewLabelDark]}>Net Income</Text>
                <Text style={[styles.overviewValue, isDark && styles.overviewValueDark]}>
                  {formatCurrency(netIncome)}
                </Text>
              </View>
              <View style={styles.overviewItem}>
                <View style={[styles.overviewIcon, { backgroundColor: '#8b5cf6' }]}>
                  <BarChart3 size={20} color="#ffffff" />
                </View>
                <Text style={[styles.overviewLabel, isDark && styles.overviewLabelDark]}>Total Balance</Text>
                <Text style={[styles.overviewValue, isDark && styles.overviewValueDark]}>
                  {formatCurrency(totalBalance)}
                </Text>
              </View>
            </View>
          </CardContent>
        </ModernCard>

        {/* Top Spending Categories */}
        {topCategories.length > 0 && (
          <ModernCard style={styles.categoriesCard}>
            <CardHeader title="Top Spending Categories" />
            <CardContent>
              <View style={styles.categoriesList}>
                {topCategories.map(renderCategoryItem)}
              </View>
            </CardContent>
          </ModernCard>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
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
              <View style={styles.transactionsList}>
                {recentTransactions.map(renderTransaction)}
              </View>
            </CardContent>
          </ModernCard>
        )}

        {/* Empty State */}
        {transactions.length === 0 && (
          <ModernCard style={styles.emptyStateCard}>
            <View style={styles.emptyState}>
              <BarChart3 size={48} color="#9ca3af" />
              <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                No data available
              </Text>
              <Text style={[styles.emptyStateSubtext, isDark && styles.emptyStateSubtextDark]}>
                Add some transactions to see your financial reports
              </Text>
              <ModernButton
                title="Add Transaction"
                onPress={() => router.push('/add-transaction')}
                variant="primary"
                size="medium"
              />
            </View>
          </ModernCard>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  loadingTextDark: {
    color: '#9ca3af',
  },
  periodCard: {
    marginBottom: 20,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  periodButtonDark: {
    backgroundColor: '#374151',
  },
  periodButtonActive: {
    backgroundColor: '#3b82f6',
  },
  periodButtonActiveDark: {
    backgroundColor: '#60a5fa',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  periodButtonTextDark: {
    color: '#9ca3af',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  periodButtonTextActiveDark: {
    color: '#ffffff',
  },
  overviewCard: {
    marginBottom: 20,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  overviewItem: {
    width: (width - 80) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  overviewLabelDark: {
    color: '#9ca3af',
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  overviewValueDark: {
    color: '#ffffff',
  },
  categoriesCard: {
    marginBottom: 20,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryItemDark: {
    borderBottomColor: '#374151',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  categoryNameDark: {
    color: '#ffffff',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryAmountDark: {
    color: '#ffffff',
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
    borderBottomColor: '#374151',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  transactionNoteDark: {
    color: '#ffffff',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionDateDark: {
    color: '#9ca3af',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#10b981',
  },
  expenseAmount: {
    color: '#ef4444',
  },
  emptyStateCard: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateTextDark: {
    color: '#9ca3af',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateSubtextDark: {
    color: '#6b7280',
  },
});