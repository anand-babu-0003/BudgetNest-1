import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/app/_layout';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Goal } from '@/types';
import { Target, Plus, Edit, Trash2, Calendar, TrendingUp, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { ModernHeader } from '@/components/ModernHeader';
import { ModernCard, CardHeader, CardContent } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';

export default function GoalsScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    target_date: '',
  });

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('user_id', '==', user?.id)
      );
      const snapshot = await getDocs(goalsQuery);
      const goalsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        target_date: doc.data().target_date.toDate(),
        created_at: doc.data().created_at.toDate()
      })) as Goal[];
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.target_amount || !formData.target_date) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const goalData = {
        user_id: user?.id,
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount),
        target_date: new Date(formData.target_date),
        created_at: new Date(),
      };

      if (editingGoal) {
        await updateDoc(doc(db, 'goals', editingGoal.id), goalData);
      } else {
        await addDoc(collection(db, 'goals'), goalData);
      }

      setModalVisible(false);
      setEditingGoal(null);
      setFormData({ name: '', target_amount: '', current_amount: '0', target_date: '' });
      loadGoals();
    } catch (error) {
      Alert.alert('Error', 'Failed to save goal');
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      target_date: goal.target_date.toISOString().split('T')[0],
    });
    setModalVisible(true);
  };

  const handleDelete = (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'goals', goal.id));
              loadGoals();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };

  const openModal = () => {
    setEditingGoal(null);
    setFormData({ name: '', target_amount: '', current_amount: '0', target_date: '' });
    setModalVisible(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const getProgressColor = (goal: Goal) => {
    const percentage = getProgressPercentage(goal);
    if (percentage >= 100) return '#10b981';
    if (percentage >= 75) return '#3b82f6';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getDaysRemaining = (targetDate: Date) => {
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isGoalCompleted = (goal: Goal) => {
    return goal.current_amount >= goal.target_amount;
  };

  const isGoalOverdue = (goal: Goal) => {
    return new Date() > goal.target_date && !isGoalCompleted(goal);
  };

  const renderGoal = (goal: Goal) => {
    const progressPercentage = getProgressPercentage(goal);
    const progressColor = getProgressColor(goal);
    const daysRemaining = getDaysRemaining(goal.target_date);
    const isCompleted = isGoalCompleted(goal);
    const isOverdue = isGoalOverdue(goal);

    return (
      <ModernCard key={goal.id} style={styles.goalCard}>
        <View style={styles.goalContent}>
          <View style={styles.goalInfo}>
            <View style={[styles.goalIcon, { backgroundColor: progressColor }]}>
              {isCompleted ? (
                <CheckCircle size={24} color="#ffffff" />
              ) : (
                <Target size={24} color="#ffffff" />
              )}
            </View>
            <View style={styles.goalDetails}>
              <Text style={[styles.goalName, isDark && styles.goalNameDark]}>
                {goal.name}
              </Text>
              <Text style={[styles.goalAmount, isDark && styles.goalAmountDark]}>
                {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
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
              <View style={styles.goalMeta}>
                <View style={styles.metaItem}>
                  <Calendar size={14} color="#6b7280" />
                  <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
                    {isOverdue ? 'Overdue' : `${daysRemaining} days left`}
                  </Text>
                </View>
                {isCompleted && (
                  <View style={styles.metaItem}>
                    <CheckCircle size={14} color="#10b981" />
                    <Text style={[styles.completedText, isDark && styles.completedTextDark]}>
                      Completed
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.goalActions}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, isDark && styles.actionButtonDark]}
                onPress={() => handleEdit(goal)}
              >
                <Edit size={16} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, isDark && styles.actionButtonDark]}
                onPress={() => handleDelete(goal)}
              >
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ModernCard>
    );
  };

  const activeGoals = goals.filter(goal => !isGoalCompleted(goal));
  const completedGoals = goals.filter(goal => isGoalCompleted(goal));

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ModernHeader
        title="Goals"
        subtitle={`${goals.length} goals • ${completedGoals.length} completed`}
        onMenuPress={() => {}}
        onNotificationPress={() => {}}
        showNotifications={false}
        showSearch={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color="#3b82f6" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Active Goals
              </Text>
            </View>
            <View style={styles.goalsList}>
              {activeGoals.map(renderGoal)}
            </View>
          </View>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckCircle size={20} color="#10b981" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Completed Goals
              </Text>
            </View>
            <View style={styles.goalsList}>
              {completedGoals.map(renderGoal)}
            </View>
          </View>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <ModernCard style={styles.emptyStateCard}>
            <View style={styles.emptyState}>
              <Target size={48} color="#9ca3af" />
              <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
                No goals yet
              </Text>
              <Text style={[styles.emptyStateSubtext, isDark && styles.emptyStateSubtextDark]}>
                Set financial goals to track your progress
              </Text>
              <ModernButton
                title="Create Goal"
                onPress={openModal}
                variant="primary"
                size="medium"
                icon={<Plus size={20} color="#ffffff" />}
              />
            </View>
          </ModernCard>
        )}

        {/* Add Goal Button */}
        {goals.length > 0 && (
          <View style={styles.addButtonContainer}>
            <ModernButton
              title="Create Goal"
              onPress={openModal}
              variant="outline"
              size="large"
              icon={<Plus size={20} color="#3b82f6" />}
              fullWidth
            />
          </View>
        )}

        {/* Add/Edit Goal Modal */}
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
                {editingGoal ? 'Edit Goal' : 'Create Goal'}
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={[styles.modalSave, isDark && styles.modalSaveDark]}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Goal Name</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Enter goal name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Target Amount</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={formData.target_amount}
                  onChangeText={(text) => setFormData({...formData, target_amount: text})}
                  placeholder="Enter target amount"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Current Amount</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={formData.current_amount}
                  onChangeText={(text) => setFormData({...formData, current_amount: text})}
                  placeholder="Enter current amount"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Target Date</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={formData.target_date}
                  onChangeText={(text) => setFormData({...formData, target_date: text})}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
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
  goalsList: {
    gap: 12,
  },
  goalCard: {
    marginBottom: 8,
  },
  goalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalDetails: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  goalNameDark: {
    color: '#ffffff',
  },
  goalAmount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  goalAmountDark: {
    color: '#9ca3af',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  metaTextDark: {
    color: '#9ca3af',
  },
  completedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginLeft: 4,
  },
  completedTextDark: {
    color: '#10b981',
  },
  goalActions: {
    alignItems: 'flex-end',
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
});