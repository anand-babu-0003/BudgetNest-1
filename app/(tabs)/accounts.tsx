import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/app/_layout';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Account } from '@/types';
import { CreditCard, Plus, Edit, Trash2, DollarSign } from 'lucide-react-native';
import { router } from 'expo-router';
import { ModernHeader } from '@/components/ModernHeader';
import { ModernCard, CardHeader, CardContent } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { Picker } from '@react-native-picker/picker';

export default function AccountsScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { openNavigation } = useNavigation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as 'cash' | 'bank' | 'credit_card' | 'investment' | 'savings',
    balance: '',
  });

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    try {
      const accountsQuery = query(
        collection(db, 'accounts'),
        where('user_id', '==', user?.id)
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

  const handleSave = async () => {
    if (!formData.name || !formData.balance) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const accountData = {
        user_id: user?.id,
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
        created_at: new Date(),
      };

      if (editingAccount) {
        await updateDoc(doc(db, 'accounts', editingAccount.id), accountData);
      } else {
        await addDoc(collection(db, 'accounts'), accountData);
      }

      setModalVisible(false);
      setEditingAccount(null);
      setFormData({ name: '', type: 'cash', balance: '' });
      loadAccounts();
    } catch (error) {
      Alert.alert('Error', 'Failed to save account');
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
    });
    setModalVisible(true);
  };

  const handleDelete = (account: Account) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'accounts', account.id));
              loadAccounts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const openModal = () => {
    setEditingAccount(null);
    setFormData({ name: '', type: 'cash', balance: '' });
    setModalVisible(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <CreditCard size={24} color="#2563eb" />; // Professional blue
      case 'credit_card':
        return <CreditCard size={24} color="#dc2626" />; // Professional red
      case 'investment':
        return <DollarSign size={24} color="#059669" />; // Professional green
      case 'savings':
        return <DollarSign size={24} color="#7c3aed" />; // Professional purple
      default:
        return <DollarSign size={24} color="#d97706" />; // Professional amber
    }
  };

  const getAccountTypeLabel = (type: string) => {
    return type.replace('_', ' ').toUpperCase();
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ModernHeader
        title="Accounts"
        subtitle={`${accounts.length} accounts • ${formatCurrency(totalBalance)} total`}
        showMenu={true}
        onMenuPress={openNavigation}
        onNotificationPress={() => {}}
        showNotifications={false}
        showSearch={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Balance Card */}
        <ModernCard style={styles.balanceCard} shadow={true}>
          <CardHeader
            title="Total Balance"
            subtitle="Across all accounts"
          />
          <CardContent>
            <Text style={[styles.totalBalance, isDark && styles.totalBalanceDark]}>
              {formatCurrency(totalBalance)}
            </Text>
          </CardContent>
        </ModernCard>

        {/* Accounts List */}
        {accounts.length > 0 ? (
          <View style={styles.accountsList}>
            {accounts.map((account) => (
              <ModernCard key={account.id} style={styles.accountCard}>
                <View style={styles.accountContent}>
                  <View style={styles.accountInfo}>
                    <View style={[styles.accountIcon, isDark && styles.accountIconDark]}>
                      {getAccountIcon(account.type)}
                    </View>
                    <View style={styles.accountDetails}>
                      <Text style={[styles.accountName, isDark && styles.accountNameDark]}>
                        {account.name}
                      </Text>
                      <Text style={[styles.accountType, isDark && styles.accountTypeDark]}>
                        {getAccountTypeLabel(account.type)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.accountActions}>
                    <Text style={[styles.accountBalance, isDark && styles.accountBalanceDark]}>
                      {formatCurrency(account.balance)}
                    </Text>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, isDark && styles.actionButtonDark]}
                        onPress={() => handleEdit(account)}
                      >
                        <Edit size={16} color="#3b82f6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, isDark && styles.actionButtonDark]}
                        onPress={() => handleDelete(account)}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ModernCard>
            ))}
          </View>
        ) : (
          <ModernCard style={styles.emptyStateCard}>
            <View style={styles.emptyState}>
              <CreditCard size={48} color="#9ca3af" />
              <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                No accounts yet
              </Text>
              <Text style={[styles.emptyStateSubtext, isDark && styles.emptyStateSubtextDark]}>
                Add your first account to start tracking your finances
              </Text>
              <ModernButton
                title="Add Account"
                onPress={openModal}
                variant="primary"
                size="medium"
                icon={<Plus size={20} color="#ffffff" />}
              />
            </View>
          </ModernCard>
        )}

        {/* Add Account Button */}
        {accounts.length > 0 && (
          <View style={styles.addButtonContainer}>
            <ModernButton
              title="Add Account"
              onPress={openModal}
              variant="outline"
              size="large"
              icon={<Plus size={20} color="#3b82f6" />}
              fullWidth
            />
          </View>
        )}

        {/* Add/Edit Account Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
            <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalCancel, isDark && styles.modalCancelDark]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                {editingAccount ? 'Edit Account' : 'Add Account'}
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={[styles.modalSave, isDark && styles.modalSaveDark]}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Account Name</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Enter account name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Account Type</Text>
                <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                  <Picker
                    selectedValue={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                    style={[styles.picker, isDark && styles.pickerDark]}
                  >
                    <Picker.Item label="Cash" value="cash" />
                    <Picker.Item label="Bank Account" value="bank" />
                    <Picker.Item label="Credit Card" value="credit_card" />
                    <Picker.Item label="Investment" value="investment" />
                    <Picker.Item label="Savings" value="savings" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Initial Balance</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={formData.balance}
                  onChangeText={(text) => setFormData({...formData, balance: text})}
                  placeholder="Enter initial balance"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
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
  balanceCard: {
    marginBottom: 20,
  },
  totalBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalBalanceDark: {
    color: '#ffffff',
  },
  accountsList: {
    gap: 12,
  },
  accountCard: {
    marginBottom: 8,
  },
  accountContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
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
    marginRight: 12,
  },
  accountIconDark: {
    backgroundColor: '#374151',
  },
  accountDetails: {
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
  accountActions: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  accountBalanceDark: {
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButtonDark: {
    backgroundColor: '#374151',
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
  addButtonContainer: {
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalContainerDark: {
    backgroundColor: '#111827',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalHeaderDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalCancelDark: {
    color: '#9ca3af',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalTitleDark: {
    color: '#ffffff',
  },
  modalSave: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalSaveDark: {
    color: '#60a5fa',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputLabelDark: {
    color: '#d1d5db',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  modalInputDark: {
    borderColor: '#4b5563',
    backgroundColor: '#374151',
    color: '#ffffff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  pickerContainerDark: {
    borderColor: '#4b5563',
    backgroundColor: '#374151',
  },
  picker: {
    height: 50,
  },
  pickerDark: {
    color: '#ffffff',
  },
});