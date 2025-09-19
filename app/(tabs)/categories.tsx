import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, FlatList } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Category } from '@/types';
import { Tag, Plus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { ModernHeader } from '@/components/ModernHeader';
import { ModernCard, CardHeader, CardContent } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { Picker } from '@react-native-picker/picker';

const categoryIcons = [
  '🍔', '🚗', '🏠', '🛒', '💊', '🎬', '🏋️', '📚', '✈️', '🎁',
  '💡', '🔧', '👕', '🍕', '☕', '🎮', '📱', '💻', '🎵', '🎨'
];

const categoryColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#9ca3af'
];

export default function CategoriesScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: '🍔',
    color: '#ef4444',
  });

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

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
    if (!formData.name) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const categoryData = {
        user_id: user?.id,
        name: formData.name,
        type: formData.type,
        icon: formData.icon,
        color: formData.color,
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
      } else {
        await addDoc(collection(db, 'categories'), categoryData);
      }

      setModalVisible(false);
      setEditingCategory(null);
      setFormData({ name: '', type: 'expense', icon: '🍔', color: '#ef4444' });
      loadCategories();
    } catch (error) {
      Alert.alert('Error', 'Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    });
    setModalVisible(true);
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'categories', category.id));
              loadCategories();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const openModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', type: 'expense', icon: '🍔', color: '#ef4444' });
    setModalVisible(true);
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const renderCategory = ({ item }: { item: Category }) => (
    <ModernCard style={styles.categoryCard} key={item.id}>
      <View style={styles.categoryContent}>
        <View style={styles.categoryInfo}>
          <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>
          <View style={styles.categoryDetails}>
            <Text style={[styles.categoryName, isDark && styles.categoryNameDark]}>
              {item.name}
            </Text>
            <Text style={[styles.categoryType, isDark && styles.categoryTypeDark]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={[styles.actionButton, isDark && styles.actionButtonDark]}
            onPress={() => handleEdit(item)}
          >
            <Edit size={16} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, isDark && styles.actionButtonDark]}
            onPress={() => handleDelete(item)}
          >
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </ModernCard>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ModernHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
        onMenuPress={() => {}}
        onNotificationPress={() => {}}
        showNotifications={false}
        showSearch={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Income Categories */}
        {incomeCategories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color="#10b981" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Income Categories
              </Text>
            </View>
            <View style={styles.categoriesList}>
              {incomeCategories.map((category) => (
                <View key={category.id}>
                  {renderCategory({ item: category })}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Expense Categories */}
        {expenseCategories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingDown size={20} color="#ef4444" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Expense Categories
              </Text>
            </View>
            <View style={styles.categoriesList}>
              {expenseCategories.map((category) => (
                <View key={category.id}>
                  {renderCategory({ item: category })}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {categories.length === 0 && (
          <ModernCard style={styles.emptyStateCard}>
            <View style={styles.emptyState}>
              <Tag size={48} color="#9ca3af" />
              <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                No categories yet
              </Text>
              <Text style={[styles.emptyStateSubtext, isDark && styles.emptyStateSubtextDark]}>
                Create categories to organize your transactions
              </Text>
              <ModernButton
                title="Add Category"
                onPress={openModal}
                variant="primary"
                size="medium"
                icon={<Plus size={20} color="#ffffff" />}
              />
            </View>
          </ModernCard>
        )}

        {/* Add Category Button */}
        {categories.length > 0 && (
          <View style={styles.addButtonContainer}>
            <ModernButton
              title="Add Category"
              onPress={openModal}
              variant="outline"
              size="large"
              icon={<Plus size={20} color="#3b82f6" />}
              fullWidth
            />
          </View>
        )}

        {/* Add/Edit Category Modal */}
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
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={[styles.modalSave, isDark && styles.modalSaveDark]}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Category Name</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Enter category name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Type</Text>
                <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                  <Picker
                    selectedValue={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                    style={[styles.picker, isDark && styles.pickerDark]}
                  >
                    <Picker.Item label="Expense" value="expense" />
                    <Picker.Item label="Income" value="income" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Icon</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
                  {categoryIcons.map((icon, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.iconOption,
                        formData.icon === icon && styles.selectedIcon,
                        isDark && styles.iconOptionDark,
                        formData.icon === icon && isDark && styles.selectedIconDark
                      ]}
                      onPress={() => setFormData({...formData, icon})}
                    >
                      <Text style={styles.iconText}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Color</Text>
                <View style={styles.colorGrid}>
                  {categoryColors.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        formData.color === color && styles.selectedColor
                      ]}
                      onPress={() => setFormData({...formData, color})}
                    />
                  ))}
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  sectionTitleDark: {
    color: '#ffffff',
  },
  categoriesList: {
    gap: 8,
  },
  categoryCard: {
    marginBottom: 8,
  },
  categoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
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
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  categoryNameDark: {
    color: '#ffffff',
  },
  categoryType: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryTypeDark: {
    color: '#9ca3af',
  },
  categoryActions: {
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
  iconScroll: {
    marginTop: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionDark: {
    backgroundColor: '#374151',
  },
  selectedIcon: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  selectedIconDark: {
    borderColor: '#60a5fa',
    backgroundColor: '#1e40af',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#1f2937',
  },
});