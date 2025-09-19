import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Transaction, Account } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ModernHeader, FloatingActionButton } from '@/components/ModernHeader';
import { ModernCard, CardHeader, CardContent } from '@/components/ModernCard';
import { safeToDate, safeToNumber } from '@/utils/dateUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors, typography, spacing, shadows, isDark } = useTheme();
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

  const netIncome = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (netIncome / monthlyIncome) * 100 : 0;

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background.primary,
      paddingBottom: insets.bottom + 85,
    }}>
      <ModernHeader
        title={getGreeting()}
        subtitle={user?.name ? `Welcome back, ${user.name}` : 'Welcome back'}
        rightIcon="notifications-outline"
        onRightPress={() => {}}
      />

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing[5] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Balance Overview Card */}
        <ModernCard 
          variant="elevated" 
          style={{ marginBottom: spacing[5] }}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 200,
              borderRadius: 16,
            }}
          />
          <View style={{ padding: spacing[5] }}>
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.text.inverse,
              opacity: 0.9,
              marginBottom: spacing[2],
            }}>
              Total Balance
            </Text>
            <Text style={{
              fontSize: typography.sizes['4xl'],
              fontWeight: typography.fontWeights.bold as any,
              color: colors.text.inverse,
              marginBottom: spacing[6],
            }}>
              {formatCurrency(totalBalance)}
            </Text>
            
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              marginBottom: spacing[4],
            }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing[1] }}>
                  <Ionicons name="trending-up" size={16} color={colors.text.inverse} />
                  <Text style={{
                    fontSize: typography.sizes.xs,
                    color: colors.text.inverse,
                    marginLeft: spacing[2],
                    opacity: 0.8,
                  }}>
                    Income
                  </Text>
                </View>
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.fontWeights.semibold as any,
                  color: colors.text.inverse,
                }}>
                  {formatCurrency(monthlyIncome)}
                </Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing[1] }}>
                  <Ionicons name="trending-down" size={16} color={colors.text.inverse} />
                  <Text style={{
                    fontSize: typography.sizes.xs,
                    color: colors.text.inverse,
                    marginLeft: spacing[2],
                    opacity: 0.8,
                  }}>
                    Expenses
                  </Text>
                </View>
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.fontWeights.semibold as any,
                  color: colors.text.inverse,
                }}>
                  {formatCurrency(monthlyExpenses)}
                </Text>
              </View>
            </View>
            
            {/* Savings Rate Indicator */}
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              padding: spacing[3],
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: typography.sizes.sm,
                color: colors.text.inverse,
                opacity: 0.9,
              }}>
                Savings Rate
              </Text>
              <Text style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.fontWeights.bold as any,
                color: colors.text.inverse,
              }}>
                {savingsRate.toFixed(1)}%
              </Text>
            </View>
          </View>
        </ModernCard>

        {/* Quick Actions Grid */}
        <ModernCard 
          variant="outlined" 
          style={{ marginBottom: spacing[5] }}
        >
          <CardHeader title="Quick Actions" />
          <CardContent>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: spacing[3],
            }}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: (width - 80) / 2 - spacing[2],
                    backgroundColor: colors.background.secondary,
                    borderRadius: 12,
                    padding: spacing[4],
                    alignItems: 'center',
                    ...shadows.sm,
                  }}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: action.color + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: spacing[3],
                  }}>
                    <Ionicons name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.fontWeights.medium as any,
                    color: colors.text.primary,
                    textAlign: 'center',
                  }}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardContent>
        </ModernCard>

        {/* Recent Transactions */}
        <ModernCard 
          variant="default" 
          style={{ marginBottom: spacing[5] }}
        >
          <CardHeader
            title="Recent Transactions"
            action={
              <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.primary,
                  fontWeight: typography.fontWeights.medium as any,
                }}>
                  View All
                </Text>
              </TouchableOpacity>
            }
          />
          <CardContent>
            {recentTransactions.length > 0 ? (
              <View>
                {recentTransactions.map((transaction, index) => (
                  <View key={transaction.id} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: spacing[3],
                    borderBottomWidth: index < recentTransactions.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: transaction.type === 'income' 
                          ? colors.financial.income + '20' 
                          : colors.financial.expense + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: spacing[3],
                      }}>
                        <Ionicons 
                          name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'}
                          size={20}
                          color={transaction.type === 'income' ? colors.financial.income : colors.financial.expense}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: typography.sizes.base,
                          fontWeight: typography.fontWeights.medium as any,
                          color: colors.text.primary,
                          marginBottom: 2,
                        }}>
                          {transaction.note || 'Transaction'}
                        </Text>
                        <Text style={{
                          fontSize: typography.sizes.sm,
                          color: colors.text.secondary,
                        }}>
                          {transaction.date.toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={{
                      fontSize: typography.sizes.lg,
                      fontWeight: typography.fontWeights.semibold as any,
                      color: transaction.type === 'income' ? colors.financial.income : colors.financial.expense,
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{
                alignItems: 'center',
                paddingVertical: spacing[10],
              }}>
                <Ionicons name="receipt-outline" size={48} color={colors.text.tertiary} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.text.secondary,
                  marginTop: spacing[3],
                  marginBottom: spacing[4],
                }}>
                  No transactions yet
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/add-transaction')}
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: spacing[5],
                    paddingVertical: spacing[3],
                    borderRadius: 8,
                  }}
                >
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.inverse,
                    fontWeight: typography.fontWeights.medium as any,
                  }}>
                    Add Transaction
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </CardContent>
        </ModernCard>

        {/* Accounts Overview */}
        <ModernCard variant="filled">
          <CardHeader
            title="Accounts Overview"
            subtitle={`${accounts.length} account${accounts.length !== 1 ? 's' : ''}`}
            action={
              <TouchableOpacity onPress={() => router.push('/(tabs)/accounts')}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.primary,
                  fontWeight: typography.fontWeights.medium as any,
                }}>
                  Manage
                </Text>
              </TouchableOpacity>
            }
          />
          <CardContent>
            {accounts.length > 0 ? (
              <View>
                {accounts.slice(0, 3).map((account, index) => (
                  <View key={account.id} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: spacing[3],
                    borderBottomWidth: index < Math.min(accounts.length, 3) - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: typography.sizes.base,
                        fontWeight: typography.fontWeights.medium as any,
                        color: colors.text.primary,
                        marginBottom: 2,
                      }}>
                        {account.name}
                      </Text>
                      <Text style={{
                        fontSize: typography.sizes.sm,
                        color: colors.text.secondary,
                      }}>
                        {account.type.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: typography.sizes.lg,
                      fontWeight: typography.fontWeights.semibold as any,
                      color: colors.text.primary,
                    }}>
                      {formatCurrency(account.balance)}
                    </Text>
                  </View>
                ))}
                {accounts.length > 3 && (
                  <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/accounts')}
                    style={{
                      paddingVertical: spacing[3],
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      color: colors.primary,
                      fontWeight: typography.fontWeights.medium as any,
                    }}>
                      View {accounts.length - 3} more account{accounts.length - 3 !== 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={{
                alignItems: 'center',
                paddingVertical: spacing[8],
              }}>
                <Ionicons name="wallet-outline" size={48} color={colors.text.tertiary} />
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.text.secondary,
                  marginTop: spacing[3],
                  marginBottom: spacing[4],
                }}>
                  No accounts added yet
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/accounts')}
                  style={{
                    backgroundColor: colors.secondary,
                    paddingHorizontal: spacing[5],
                    paddingVertical: spacing[3],
                    borderRadius: 8,
                  }}
                >
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.inverse,
                    fontWeight: typography.fontWeights.medium as any,
                  }}>
                    Add Account
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </CardContent>
        </ModernCard>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="add"
        onPress={() => router.push('/add-transaction')}
        variant="primary"
      />
    </View>
  );
}