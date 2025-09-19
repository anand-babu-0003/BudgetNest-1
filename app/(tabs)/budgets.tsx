import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/app/_layout';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Budget, Category } from '@/types';
import { Target, Plus, Edit, Trash2, AlertTriangle, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';
import { ModernHeader } from '@/components/ModernHeader';
import { ModernCard, CardHeader, CardContent } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { Picker } from '@react-native-picker/picker';

export default function BudgetsScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { openNavigation } = useNavigation();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    spent: '0',
    recurrence: 'monthly' as 'monthly' | 'weekly' | 'yearly',
  });

  useEffect(() => {
    if (user) {
      loadBudgets();
      loadCategories();
    }
  }, [user]);

  const loadBudgets = async () => {
    try {
      const budgetsQuery = query(
        collection(db, 'budgets'),
        where('user_id', '==', user?.id)
      );
      const snapshot = await getDocs(budgetsQuery);
      const budgetsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        start_date: doc.data().start_date.toDate()
      })) as Budget[];
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesQuery = query(
        collection(db, 'categories'),
        where('user_id', '==', user?.id)
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

  const handleSave = async () => {
    if (!formData.category_id || !formData.amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const budgetData = {
        user_id: user?.id,
        category_id: formData.category_id,
        amount: parseFloat(formData.amount),
        spent: parseFloat(formData.spent),
        recurrence: formData.recurrence,
        start_date: new Date(),
      };

      if (editingBudget) {
        await updateDoc(doc(db, 'budgets', editingBudget.id), budgetData);
      } else {
        await addDoc(collection(db, 'budgets'), budgetData);
      }

      setModalVisible(false);
      setEditingBudget(null);
      setFormData({ category_id: '', amount: '', spent: '0', recurrence: 'monthly' });
      loadBudgets();
    } catch (error) {
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount.toString(),
      spent: budget.spent.toString(),
      recurrence: budget.recurrence,
    });
    setModalVisible(true);
  };

  const handleDelete = (budget: Budget) => {
    const category = categories.find(cat => cat.id === budget.category_id);
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete the budget for "${category?.name || 'Unknown Category'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'budgets', budget.id));
              loadBudgets();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const openModal = () => {
    setEditingBudget(null);
    setFormData({ category_id: '', amount: '', spent: '0', recurrence: 'monthly' });
    setModalVisible(true);
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

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || '💰';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6b7280';
  };

  const getProgressPercentage = (budget: Budget) => {
    return Math.min((budget.spent / budget.amount) * 100, 100);
  };

  const getProgressColor = (budget: Budget) => {
    const percentage = getProgressPercentage(budget);
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f59e0b';
    return '#10b981';
  };

  const renderBudget = (budget: Budget) => {
    const progressPercentage = getProgressPercentage(budget);
    const progressColor = getProgressColor(budget);
    const isOverBudget = budget.spent > budget.amount;

    return (
      <ModernCard key={budget.id} style={styles.budgetCard}>
        <View style={styles.budgetContent}>
          <View style={styles.budgetInfo}>
            <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(budget.category_id) }]}>
              <Text style={styles.iconText}>{getCategoryIcon(budget.category_id)}</Text>
            </View>
            <View style={styles.budgetDetails}>
              <Text style={[styles.categoryName, isDark && styles.categoryNameDark]}>
                {getCategoryName(budget.category_id)}
              </Text>
              <Text style={[styles.budgetAmount, isDark && styles.budgetAmountDark]}>
                {formatCurrency(budget.amount)} / {budget.recurrence}
              </Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, isDark && styles.progressBarDark]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(progressPercentage, 100)}%`,
                        backgroundColor: progressColor
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
                  {progressPercentage.toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.budgetActions}>
            <Text style={[styles.spentAmount, isDark && styles.spentAmountDark]}>
              {formatCurrency(budget.spent)}
            </Text>
            {isOverBudget && (
              <AlertTriangle size={16} color="#ef4444" style={styles.warningIcon} />
            )}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, isDark && styles.actionButtonDark]}
                onPress={() => handleEdit(budget)}
              >
                <Edit size={16} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, isDark && styles.actionButtonDark]}
                onPress={() => handleDelete(budget)}
              >
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ModernCard>
    );
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ModernHeader
        title="Budgets"
        subtitle={`${budgets.length} active budgets`}
        showMenu={true}
        onMenuPress={openNavigation}
        onNotificationPress={() => {}}
        showNotifications={false}
        showSearch={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Budgets List */}
        {budgets.length > 0 ? (
          <View style={styles.budgetsList}>
            {budgets.map(renderBudget)}
          </View>
        ) : (
          <ModernCard style={styles.emptyStateCard}>
            <View style={styles.emptyState}>
              <Target size={48} color="#9ca3af" />
              <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                No budgets yet
              </Text>
              <Text style={[styles.emptyStateSubtext, isDark && styles.emptyStateSubtextDark]}>
                Create budgets to track your spending
              </Text>
              <ModernButton
                title="Create Budget"
                onPress={openModal}
                variant="primary"
                size="medium"
                icon={<Plus size={20} color="#ffffff" />}
              />
            </View>
          </ModernCard>
        )}

        {/* Add Budget Button */}
        {budgets.length > 0 && (
          <View style={styles.addButtonContainer}>
            <ModernButton
              title="Create Budget"
              onPress={openModal}
              variant="outline"
              size="large"
              icon={<Plus size={20} color="#3b82f6" />}
              fullWidth
            />
          </View>
        )}

        {/* Add/Edit Budget Modal */}
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
                {editingBudget ? 'Edit Budget' : 'Create Budget'}
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={[styles.modalSave, isDark && styles.modalSaveDark]}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Category</Text>
                <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                  <Picker
                    selectedValue={formData.category_id}
                    onValueChange={(value) => setFormData({...formData, category_id: value})}
                    style={[styles.picker, isDark && styles.pickerDark]}
                  >
                    <Picker.Item label="Select a category" value="" />
                    {categories.map((category) => (
                      <Picker.Item key={category.id} label={category.name} value={category.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Budget Amount</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={formData.amount}
                  onChangeText={(text) => setFormData({...formData, amount: text})}
                  placeholder="Enter budget amount"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Already Spent</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={formData.spent}
                  onChangeText={(text) => setFormData({...formData, spent: text})}
                  placeholder="Enter amount already spent"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Recurrence</Text>
                <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                  <Picker
                    selectedValue={formData.recurrence}
                    onValueChange={(value) => setFormData({...formData, recurrence: value})}
                    style={[styles.picker, isDark && styles.pickerDark]}
                  >
                    <Picker.Item label="Monthly" value="monthly" />
                    <Picker.Item label="Weekly" value="weekly" />
                    <Picker.Item label="Yearly" value="yearly" />
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
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  budgetsList: {
    gap: 12,
  },
  budgetCard: {
    marginBottom: 8,
  },
  budgetContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  budgetDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryNameDark: {
    color: '#ffffff',
  },
  budgetAmount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  budgetAmountDark: {
    color: '#9ca3af',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 8,
  },
  progressBarDark: {
    backgroundColor: '#374151',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    minWidth: 30,
  },
  progressTextDark: {
    color: '#9ca3af',
  },
  budgetActions: {
    alignItems: 'flex-end',
  },
  spentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  spentAmountDark: {
    color: '#ffffff',
  },
  warningIcon: {
    marginBottom: 4,
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