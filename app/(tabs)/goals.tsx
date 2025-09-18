import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase.config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Goal } from '@/types';
import { Plus, Target, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';

export default function GoalsScreen() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('user_id', '==', user.id)
      );
      
      const snapshot = await getDocs(goalsQuery);
      const goalsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        target_date: doc.data().target_date.toDate(),
        created_at: doc.data().created_at.toDate()
      } as Goal));
      
      setGoals(goalsList);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSampleGoal = async () => {
    if (!user) return;

    try {
      const targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() + 1);

      const newGoal: Omit<Goal, 'id'> = {
        user_id: user.id,
        name: 'Emergency Fund',
        target_amount: 10000,
        current_amount: 2500,
        target_date: targetDate,
        created_at: new Date(),
      };

      await addDoc(collection(db, 'goals'), newGoal);
      loadGoals();
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getGoalProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate: Date) => {
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderGoal = ({ item }: { item: Goal }) => {
    const progress = getGoalProgress(item.current_amount, item.target_amount);
    const daysRemaining = getDaysRemaining(item.target_date);
    const isCompleted = progress >= 100;
    const isOverdue = daysRemaining < 0 && !isCompleted;
    
    return (
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalName}>{item.name}</Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓</Text>
            </View>
          )}
        </View>
        
        <View style={styles.goalAmount}>
          <Text style={styles.currentAmount}>
            {formatCurrency(item.current_amount)}
          </Text>
          <Text style={styles.targetAmount}>
            of {formatCurrency(item.target_amount)}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: '#e5e7eb' }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`,
                  backgroundColor: isCompleted ? '#10b981' : '#3b82f6'
                }
              ]} 
            />
          </View>
          <Text style={[
            styles.progressText, 
            { color: isCompleted ? '#10b981' : '#3b82f6' }
          ]}>
            {progress.toFixed(0)}%
          </Text>
        </View>
        
        <View style={styles.goalFooter}>
          <View style={styles.dateInfo}>
            <Calendar size={16} color="#6b7280" />
            <Text style={[
              styles.dateText,
              { color: isOverdue ? '#ef4444' : '#6b7280' }
            ]}>
              {isCompleted 
                ? 'Completed!' 
                : isOverdue 
                  ? `${Math.abs(daysRemaining)} days overdue`
                  : `${daysRemaining} days left`
              }
            </Text>
          </View>
          <Text style={styles.targetDateText}>
            {format(item.target_date, 'MMM dd, yyyy')}
          </Text>
        </View>
        
        {!isCompleted && (
          <Text style={styles.remainingText}>
            {formatCurrency(item.target_amount - item.current_amount)} remaining
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading goals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addSampleGoal}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Target size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No goals set</Text>
          <Text style={styles.emptySubtext}>
            Set financial goals to stay motivated and track your progress
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={addSampleGoal}
          >
            <Plus size={20} color="white" />
            <Text style={styles.emptyButtonText}>Create Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
    padding: 20,
  },
  goalCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  targetAmount: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    marginLeft: 4,
  },
  targetDateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  remainingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});