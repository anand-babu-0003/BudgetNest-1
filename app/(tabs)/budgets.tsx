import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase.config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Budget } from '@/types';
import { Plus, Target, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function BudgetsScreen() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBudgets();
    }
  }, [user]);

  const loadBudgets = async () => {
    if (!user) return;

    try {
      const budgetsQuery = query(
        collection(db, 'budgets'),
        where('user_id', '==', user.id)
      );
      
      const snapshot = await getDocs(budgetsQuery);
      const budgetsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        start_date: doc.data().start_date.toDate()
      } as Budget));
      
      setBudgets(budgetsList);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSampleBudget = async () => {
    if (!user) return;

    try {
      const newBudget: Omit<Budget, 'id'> = {
        user_id: user.id,
        category_id: 'sample-category',
        amount: 1000,
        spent: 350,
        recurrence: 'monthly',
        start_date: new Date(),
      };

      await addDoc(collection(db, 'budgets'), newBudget);
      loadBudgets();
    } catch (error) {
      Alert.alert('Error', 'Failed to create budget');
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getBudgetStatus = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return { color: '#ef4444', status: 'over' };
    if (percentage >= 80) return { color: '#f59e0b', status: 'warning' };
    return { color: '#10b981', status: 'good' };
  };

  const renderBudget = ({ item }: { item: Budget }) => {
    const status = getBudgetStatus(item.spent, item.amount);
    const percentage = Math.min((item.spent / item.amount) * 100, 100);
    
    return (
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetCategory}>Food & Dining</Text>
            <Text style={styles.budgetPeriod}>{item.recurrence}</Text>
          </View>
          {status.status === 'warning' && (
            <AlertTriangle size={20} color={status.color} />
          )}
        </View>
        
        <View style={styles.budgetAmount}>
          <Text style={styles.spentAmount}>
            {formatCurrency(item.spent)}
          </Text>
          <Text style={styles.totalAmount}>
            of {formatCurrency(item.amount)}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: '#e5e7eb' }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${percentage}%`,
                  backgroundColor: status.color 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: status.color }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
        
        <Text style={styles.remainingText}>
          {item.amount - item.spent > 0 
            ? `${formatCurrency(item.amount - item.spent)} remaining`
            : `${formatCurrency(item.spent - item.amount)} over budget`
          }
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading budgets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addSampleBudget}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <View style={styles.emptyState}>
          <Target size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No budgets set</Text>
          <Text style={styles.emptySubtext}>
            Create budgets to track your spending and stay on target
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={addSampleBudget}
          >
            <Plus size={20} color="white" />
            <Text style={styles.emptyButtonText}>Create Budget</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={budgets}
          renderItem={renderBudget}
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
  budgetCard: {
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
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  budgetPeriod: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  budgetAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  spentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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