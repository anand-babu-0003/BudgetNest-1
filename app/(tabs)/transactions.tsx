import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/app/_layout';
import { db } from '@/firebase.config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Transaction, Account, Category } from '@/types';
import { Search, Filter, Plus, Edit, Trash2, DollarSign } from 'lucide-react-native';
import { router } from 'expo-router';
import { ModernHeader } from '@/components/ModernHeader';
import { ModernCard, CardHeader, CardContent } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { Picker } from '@react-native-picker/picker';

export default function TransactionsScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { openNavigation } = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadCategories();
      loadAccounts();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, filterType, filterCategory, filterAccount]);

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
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
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date)
        };
      }) as Transaction[];
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadCategories = async () => {
    if (!user) return;
    
    try {
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
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadAccounts = async () => {
    if (!user) return;
    
    try {
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
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.category_id === filterCategory);
    }

    // Account filter
    if (filterAccount !== 'all') {
      filtered = filtered.filter(transaction => transaction.account_id === filterAccount);
    }

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterAccount('all');
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

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.name || 'Unknown';
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <ModernCard style={styles.transactionCard} key={item.id}>
      <View style={styles.transactionContent}>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionNote, isDark && styles.transactionNoteDark]}>
            {item.note || 'Transaction'}
          </Text>
          <Text style={[styles.transactionDetails, isDark && styles.transactionDetailsDark]}>
            {getCategoryName(item.category_id)} • {getAccountName(item.account_id)}
          </Text>
          <Text style={[styles.transactionDate, isDark && styles.transactionDateDark]}>
            {item.date.toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.amountText,
              item.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
            ]}
          >
            {item.type === 'income' ? '+' : '-'}
            {formatCurrency(item.amount)}
          </Text>
        </View>
      </View>
    </ModernCard>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ModernHeader
        title="Transactions"
        subtitle={`${filteredTransactions.length} transactions`}
        showMenu={true}
        onMenuPress={openNavigation}
        onSearchPress={() => setFilterModalVisible(true)}
        showNotifications={false}
        showSearch={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search and Filter Bar */}
        <ModernCard style={styles.searchCard}>
          <View style={styles.searchContainer}>
            <View style={[styles.searchInput, isDark && styles.searchInputDark]}>
              <Search size={20} color="#9ca3af" />
              <TextInput
                style={[styles.searchTextInput, isDark && styles.searchTextInputDark]}
                placeholder="Search transactions..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
              />
            </View>
            <TouchableOpacity
              style={[styles.filterButton, isDark && styles.filterButtonDark]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Filter size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </ModernCard>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {filteredTransactions.map((transaction) => (
              <View key={transaction.id}>
                {renderTransaction({ item: transaction })}
              </View>
            ))}
          </View>
        ) : (
          <ModernCard style={styles.emptyStateCard}>
            <View style={styles.emptyState}>
              <DollarSign size={48} color="#9ca3af" />
              <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                {searchQuery || filterType !== 'all' || filterCategory !== 'all' || filterAccount !== 'all'
                  ? 'No transactions match your filters'
                  : 'No transactions yet'
                }
              </Text>
              <ModernButton
                title="Add Transaction"
                onPress={() => router.push('/add-transaction')}
                variant="primary"
                size="medium"
                icon={<Plus size={20} color="#ffffff" />}
              />
            </View>
          </ModernCard>
        )}

        {/* Filter Modal */}
        <Modal
          visible={filterModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
            <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={[styles.modalCancel, isDark && styles.modalCancelDark]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Filter Transactions</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={[styles.modalClear, isDark && styles.modalClearDark]}>Clear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>Type</Text>
                <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                  <Picker
                    selectedValue={filterType}
                    onValueChange={setFilterType}
                    style={[styles.picker, isDark && styles.pickerDark]}
                  >
                    <Picker.Item label="All Types" value="all" />
                    <Picker.Item label="Income" value="income" />
                    <Picker.Item label="Expense" value="expense" />
                  </Picker>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>Category</Text>
                <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                  <Picker
                    selectedValue={filterCategory}
                    onValueChange={setFilterCategory}
                    style={[styles.picker, isDark && styles.pickerDark]}
                  >
                    <Picker.Item label="All Categories" value="all" />
                    {categories.map((category) => (
                      <Picker.Item key={category.id} label={category.name} value={category.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, isDark && styles.filterLabelDark]}>Account</Text>
                <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                  <Picker
                    selectedValue={filterAccount}
                    onValueChange={setFilterAccount}
                    style={[styles.picker, isDark && styles.pickerDark]}
                  >
                    <Picker.Item label="All Accounts" value="all" />
                    {accounts.map((account) => (
                      <Picker.Item key={account.id} label={account.name} value={account.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Pure white background
  },
  containerDark: {
    backgroundColor: '#ffffff', // Always white for professional theme
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchCard: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // Light gray background
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInputDark: {
    backgroundColor: '#f8fafc', // Same for professional theme
    borderColor: '#e2e8f0',
  },
  searchTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a', // Dark text for readability
    marginLeft: 8,
  },
  searchTextInputDark: {
    color: '#0f172a', // Always dark text
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9', // Light blue-gray
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonDark: {
    backgroundColor: '#f1f5f9', // Same for professional theme
    borderColor: '#e2e8f0',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a', // Professional dark text
    marginBottom: 4,
  },
  transactionNoteDark: {
    color: '#0f172a', // Always dark for readability
  },
  transactionDetails: {
    fontSize: 14,
    color: '#64748b', // Medium gray
    marginBottom: 2,
  },
  transactionDetailsDark: {
    color: '#64748b', // Same for professional theme
  },
  transactionDate: {
    fontSize: 12,
    color: '#94a3b8', // Light gray
  },
  transactionDateDark: {
    color: '#94a3b8', // Same for professional theme
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700', // Bold for emphasis
  },
  incomeAmount: {
    color: '#059669', // Professional green
  },
  expenseAmount: {
    color: '#dc2626', // Professional red
  },
  emptyStateCard: {
    marginTop: 40,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b', // Medium gray
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateTextDark: {
    color: '#64748b', // Same for professional theme
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff', // Pure white modal
  },
  modalContainerDark: {
    backgroundColor: '#ffffff', // Always white
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // Light border
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalHeaderDark: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e2e8f0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#64748b', // Medium gray
    fontWeight: '500',
  },
  modalCancelDark: {
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700', // Bold title
    color: '#0f172a', // Dark text
  },
  modalTitleDark: {
    color: '#0f172a',
  },
  modalClear: {
    fontSize: 16,
    color: '#2563eb', // Professional blue
    fontWeight: '600',
  },
  modalClearDark: {
    color: '#2563eb',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151', // Professional dark gray
    marginBottom: 8,
  },
  filterLabelDark: {
    color: '#374151',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0', // Light border
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerContainerDark: {
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
    color: '#0f172a', // Dark text
  },
  pickerDark: {
    color: '#0f172a',
  },
});