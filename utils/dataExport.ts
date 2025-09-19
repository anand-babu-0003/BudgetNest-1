import { db } from '../firebase.config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User, Account, Category, Transaction, Budget, Goal } from '@/types';
import { safeToDate, safeToNumber, safeToString } from './dateUtils';

export interface ExportData {
  user: User;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  exportDate: string;
  version: string;
}

export const exportUserData = async (userId: string): Promise<ExportData> => {
  try {
    // Fetch all user data
    const [userDoc, accountsSnapshot, categoriesSnapshot, transactionsSnapshot, budgetsSnapshot, goalsSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('id', '==', userId))),
      getDocs(query(collection(db, 'accounts'), where('user_id', '==', userId))),
      getDocs(query(collection(db, 'categories'), where('user_id', '==', userId))),
      getDocs(query(collection(db, 'transactions'), where('user_id', '==', userId))),
      getDocs(query(collection(db, 'budgets'), where('user_id', '==', userId))),
      getDocs(query(collection(db, 'goals'), where('user_id', '==', userId)))
    ]);

    const user = userDoc.docs[0]?.data() as User;
    const accounts = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
    const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    const transactions = transactionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: safeToDate(data.date),
        amount: safeToNumber(data.amount, 0)
      };
    }) as Transaction[];
    const budgets = budgetsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        start_date: safeToDate(data.start_date),
        amount: safeToNumber(data.amount, 0),
        spent: safeToNumber(data.spent, 0)
      };
    }) as Budget[];
    const goals = goalsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        target_date: safeToDate(data.target_date),
        created_at: safeToDate(data.created_at),
        target_amount: safeToNumber(data.target_amount, 0),
        current_amount: safeToNumber(data.current_amount, 0)
      };
    }) as Goal[];

    return {
      user,
      accounts,
      categories,
      transactions,
      budgets,
      goals,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

export const generateCSV = (data: ExportData): string => {
  const csvLines: string[] = [];
  
  // Add header
  csvLines.push('BudgetNest Data Export');
  csvLines.push(`Export Date: ${data.exportDate}`);
  csvLines.push(`Version: ${data.version}`);
  csvLines.push('');

  // Accounts
  csvLines.push('ACCOUNTS');
  csvLines.push('Name,Type,Balance,Created At');
  data.accounts.forEach(account => {
    csvLines.push(`"${account.name}","${account.type}",${account.balance},"${account.created_at}"`);
  });
  csvLines.push('');

  // Categories
  csvLines.push('CATEGORIES');
  csvLines.push('Name,Type,Icon,Color');
  data.categories.forEach(category => {
    csvLines.push(`"${category.name}","${category.type}","${category.icon}","${category.color}"`);
  });
  csvLines.push('');

  // Transactions
  csvLines.push('TRANSACTIONS');
  csvLines.push('Date,Type,Amount,Note,Category,Account');
  data.transactions.forEach(transaction => {
    const category = data.categories.find(c => c.id === transaction.category_id);
    const account = data.accounts.find(a => a.id === transaction.account_id);
    csvLines.push(`"${transaction.date.toISOString()}","${transaction.type}",${transaction.amount},"${transaction.note || ''}","${category?.name || ''}","${account?.name || ''}"`);
  });
  csvLines.push('');

  // Budgets
  csvLines.push('BUDGETS');
  csvLines.push('Category,Amount,Spent,Recurrence,Start Date');
  data.budgets.forEach(budget => {
    const category = data.categories.find(c => c.id === budget.category_id);
    csvLines.push(`"${category?.name || ''}",${budget.amount},${budget.spent},"${budget.recurrence}","${budget.start_date.toISOString()}"`);
  });
  csvLines.push('');

  // Goals
  csvLines.push('GOALS');
  csvLines.push('Name,Target Amount,Current Amount,Target Date,Created At');
  data.goals.forEach(goal => {
    csvLines.push(`"${goal.name}",${goal.target_amount},${goal.current_amount},"${goal.target_date.toISOString()}","${goal.created_at.toISOString()}"`);
  });

  return csvLines.join('\n');
};

export const generateJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};


