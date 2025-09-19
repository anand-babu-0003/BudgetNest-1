import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, RefreshControl, FlatList, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Transaction, Account, Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ModernHeader, FloatingActionButton } from '@/components/ModernHeader';
import { ModernCard, CardHeader, CardContent } from '@/components/ModernCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { safeToDate, safeToNumber } from '@/utils/dateUtils';

interface FilterOptions {
  type: 'all' | 'income' | 'expense';
  category: string;
  account: string;
  dateRange: 'all' | 'week' | 'month' | 'year';
}

export default function TransactionsScreen() {
  const { user } = useAuth();
  const { colors, typography, spacing, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    category: 'all',
    account: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, filters]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await Promise.all([
        loadTransactions(),
        loadCategories(),
        loadAccounts()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;
    
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('user_id', '==', user.id),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(transactionsQuery);
    const transactionsData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: safeToDate(data.date),
        amount: safeToNumber(data.amount, 0)
      };
    }) as Transaction[];
    setTransactions(transactionsData);
  };

  const loadCategories = async () => {
    if (!user) return;
    
    const categoriesQuery = query(
      collection(db, 'categories'),
      where('user_id', '==', user.id)
    );
    const snapshot = await getDocs(categoriesQuery);
    const categoriesData = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Category[];
    setCategories(categoriesData);
  };

  const loadAccounts = async () => {
    if (!user) return;
    
    const accountsQuery = query(
      collection(db, 'accounts'),
      where('user_id', '==', user.id)
    );
    const snapshot = await getDocs(accountsQuery);
    const accountsData = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Account[];
    setAccounts(accountsData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(transaction =>
        transaction.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryName(transaction.category_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getAccountName(transaction.account_id).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(transaction => transaction.category_id === filters.category);
    }

    // Account filter
    if (filters.account !== 'all') {
      filtered = filtered.filter(transaction => transaction.account_id === filters.account);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(transaction => transaction.date >= cutoffDate);
    }

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      type: 'all',
      category: 'all',
      account: 'all',
      dateRange: 'all'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.name || 'Unknown Account';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || colors.text.tertiary;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <ModernCard 
      style={{ marginBottom: spacing[3] }}
      variant="default"
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[4],
      }}>
        {/* Transaction Icon */}
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: item.type === 'income' 
            ? colors.financial.income + '20' 
            : colors.financial.expense + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: spacing[4],
        }}>
          <Ionicons 
            name={item.type === 'income' ? 'arrow-down' : 'arrow-up'}
            size={24}
            color={item.type === 'income' ? colors.financial.income : colors.financial.expense}
          />
        </View>

        {/* Transaction Details */}
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: typography.sizes.base,
            fontWeight: typography.fontWeights.medium as any,
            color: colors.text.primary,
            marginBottom: 2,
          }}>
            {item.note || 'Transaction'}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: getCategoryColor(item.category_id),
              marginRight: spacing[2],
            }} />
            <Text style={{
              fontSize: typography.sizes.sm,
              color: colors.text.secondary,
            }}>
              {getCategoryName(item.category_id)}
            </Text>
          </View>
          
          <Text style={{
            fontSize: typography.sizes.xs,
            color: colors.text.tertiary,
          }}>
            {getAccountName(item.account_id)} • {item.date.toLocaleDateString()}
          </Text>
        </View>

        {/* Amount */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.fontWeights.semibold as any,
            color: item.type === 'income' ? colors.financial.income : colors.financial.expense,
          }}>
            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
        </View>
      </View>
    </ModernCard>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={{
        flex: 1,
        backgroundColor: colors.background.primary,
        paddingTop: insets.top,
      }}>
        {/* Modal Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: spacing[5],
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <Text style={{
            fontSize: typography.sizes.xl,
            fontWeight: typography.fontWeights.bold as any,
            color: colors.text.primary,
          }}>
            Filter Transactions
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: spacing[5] }}>
          {/* Transaction Type Filter */}
          <ModernCard style={{ marginBottom: spacing[5] }}>
            <CardHeader title="Transaction Type" />
            <CardContent>
              <View style={{ flexDirection: 'row', gap: spacing[3] }}>
                {['all', 'income', 'expense'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={{
                      flex: 1,
                      paddingVertical: spacing[3],
                      paddingHorizontal: spacing[4],
                      borderRadius: 8,
                      backgroundColor: filters.type === type ? colors.primary : colors.background.secondary,
                      alignItems: 'center',
                    }}
                    onPress={() => setFilters({ ...filters, type: type as any })}
                  >
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.fontWeights.medium as any,
                      color: filters.type === type ? colors.text.inverse : colors.text.primary,
                    }}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </CardContent>
          </ModernCard>

          {/* Date Range Filter */}
          <ModernCard style={{ marginBottom: spacing[5] }}>
            <CardHeader title="Date Range" />
            <CardContent>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] }}>
                {[
                  { key: 'all', label: 'All Time' },
                  { key: 'week', label: 'Last Week' },
                  { key: 'month', label: 'Last Month' },
                  { key: 'year', label: 'Last Year' }
                ].map((range) => (
                  <TouchableOpacity
                    key={range.key}
                    style={{
                      paddingVertical: spacing[3],
                      paddingHorizontal: spacing[4],
                      borderRadius: 8,
                      backgroundColor: filters.dateRange === range.key ? colors.primary : colors.background.secondary,
                      minWidth: '48%',
                      alignItems: 'center',
                    }}
                    onPress={() => setFilters({ ...filters, dateRange: range.key as any })}
                  >
                    <Text style={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.fontWeights.medium as any,
                      color: filters.dateRange === range.key ? colors.text.inverse : colors.text.primary,
                    }}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </CardContent>
          </ModernCard>

          {/* Clear Filters Button */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.background.secondary,
              paddingVertical: spacing[4],
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: spacing[8],
            }}
            onPress={clearFilters}
          >
            <Text style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.fontWeights.medium as any,
              color: colors.text.primary,
            }}>
              Clear All Filters
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  const hasActiveFilters = filters.type !== 'all' || 
                          filters.category !== 'all' || 
                          filters.account !== 'all' || 
                          filters.dateRange !== 'all' || 
                          searchQuery.trim() !== '';

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background.primary,
      paddingBottom: insets.bottom + 85,
    }}>
      <ModernHeader
        title="Transactions"
        subtitle={`${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? 's' : ''}`}
      />

      {/* Search and Filter Bar */}
      <View style={{
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[3],
      }}>
        <ModernCard variant="outlined">
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing[3],
          }}>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.background.secondary,
              borderRadius: 8,
              paddingHorizontal: spacing[3],
            }}>
              <Ionicons name="search" size={20} color={colors.text.tertiary} />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: spacing[3],
                  paddingLeft: spacing[2],
                  fontSize: typography.sizes.base,
                  color: colors.text.primary,
                }}
                placeholder="Search transactions..."
                placeholderTextColor={colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity
              style={{
                marginLeft: spacing[3],
                padding: spacing[3],
                borderRadius: 8,
                backgroundColor: hasActiveFilters ? colors.primary : colors.background.secondary,
              }}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons 
                name="options" 
                size={20} 
                color={hasActiveFilters ? colors.text.inverse : colors.text.primary} 
              />
            </TouchableOpacity>
          </View>
        </ModernCard>
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing[5],
          paddingTop: spacing[3],
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={{
            alignItems: 'center',
            paddingVertical: spacing[12],
          }}>
            <Ionicons name="receipt-outline" size={64} color={colors.text.tertiary} />
            <Text style={{
              fontSize: typography.sizes.lg,
              color: colors.text.secondary,
              marginTop: spacing[4],
              marginBottom: spacing[2],
            }}>
              No transactions found
            </Text>
            <Text style={{
              fontSize: typography.sizes.base,
              color: colors.text.tertiary,
              textAlign: 'center',
              lineHeight: typography.lineHeights.relaxed * typography.sizes.base,
            }}>
              {hasActiveFilters 
                ? 'Try adjusting your filters or search query'
                : 'Start by adding your first transaction'
              }
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity
                style={{
                  marginTop: spacing[4],
                  backgroundColor: colors.primary,
                  paddingHorizontal: spacing[5],
                  paddingVertical: spacing[3],
                  borderRadius: 8,
                }}
                onPress={clearFilters}
              >
                <Text style={{
                  fontSize: typography.sizes.sm,
                  color: colors.text.inverse,
                  fontWeight: typography.fontWeights.medium as any,
                }}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Filter Modal */}
      <FilterModal />

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="add"
        onPress={() => router.push('/add-transaction')}
        variant="primary"
      />
    </View>
  );
}