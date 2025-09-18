import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase.config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Transaction } from '@/types';
import { ChartBar as BarChart, Download, TrendingUp, TrendingDown } from 'lucide-react-native';
import { VictoryPie, VictoryChart, VictoryLine, VictoryArea } from 'victory-native';

export default function ReportsScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('user_id', '==', user.id)
      );
      
      const snapshot = await getDocs(transactionsQuery);
      const transactionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      } as Transaction));
      
      setTransactions(transactionsList);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getMonthlyData = () => {
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      const month = transaction.date.toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expenses += transaction.amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getCategoryData = () => {
    const categoryData = {};
    
    transactions.filter(t => t.type === 'expense').forEach(transaction => {
      const category = 'General'; // Would normally get from categories collection
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += transaction.amount;
    });

    return Object.entries(categoryData).map(([category, amount]) => ({
      category,
      amount,
      y: amount
    }));
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading reports...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Download size={20} color="#3b82f6" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <TrendingUp size={20} color="#10b981" />
            <Text style={styles.summaryTitle}>Total Income</Text>
          </View>
          <Text style={[styles.summaryAmount, styles.incomeText]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <TrendingDown size={20} color="#ef4444" />
            <Text style={styles.summaryTitle}>Total Expenses</Text>
          </View>
          <Text style={[styles.summaryAmount, styles.expenseText]}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <BarChart size={20} color="#3b82f6" />
            <Text style={styles.summaryTitle}>Net Income</Text>
          </View>
          <Text style={[
            styles.summaryAmount, 
            totalIncome - totalExpenses >= 0 ? styles.incomeText : styles.expenseText
          ]}>
            {formatCurrency(totalIncome - totalExpenses)}
          </Text>
        </View>
      </View>

      {categoryData.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Expenses by Category</Text>
          <View style={styles.chartContainer}>
            <VictoryPie
              data={categoryData}
              x="category"
              y="amount"
              width={300}
              height={200}
              colorScale={["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"]}
            />
          </View>
        </View>
      )}

      {monthlyData.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Monthly Trends</Text>
          <View style={styles.chartContainer}>
            <VictoryChart width={300} height={200}>
              <VictoryArea
                data={monthlyData}
                x="month"
                y="income"
                style={{ data: { fill: "#10b981", fillOpacity: 0.6 } }}
              />
              <VictoryArea
                data={monthlyData}
                x="month"
                y="expenses"
                style={{ data: { fill: "#ef4444", fillOpacity: 0.6 } }}
              />
            </VictoryChart>
          </View>
        </View>
      )}

      {transactions.length === 0 && (
        <View style={styles.emptyState}>
          <BarChart size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No data to display</Text>
          <Text style={styles.emptySubtext}>
            Add some transactions to see your financial reports
          </Text>
        </View>
      )}
    </ScrollView>
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    gap: 8,
  },
  exportText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  summarySection: {
    padding: 20,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#10b981',
  },
  expenseText: {
    color: '#ef4444',
  },
  chartSection: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});