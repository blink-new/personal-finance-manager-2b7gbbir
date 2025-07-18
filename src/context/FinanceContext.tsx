import React, { useReducer, useEffect } from 'react';
import { Account, Category, TransactionWithDetails } from '../types';
import { FinanceContextType, initialState, financeReducer } from './FinanceTypes';
import { FinanceContext } from './context';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('financeData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Convert date strings back to Date objects and ensure all required properties exist
        const processedData = {
          ...initialState, // Start with initial state to ensure all properties exist
          ...parsedData,
          accounts: parsedData.accounts?.map((acc: any) => ({
            ...acc,
            createdAt: new Date(acc.createdAt),
          })) || [],
          transactions: parsedData.transactions?.map((txn: any) => ({
            ...txn,
            date: new Date(txn.date),
            createdAt: new Date(txn.createdAt),
          })) || [],
          categories: parsedData.categories || [],
          darkMode: parsedData.darkMode ?? false,
        };
        dispatch({ type: 'LOAD_DATA', payload: processedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
        initializeDefaultData();
      }
    } else {
      initializeDefaultData();
    }
    setIsInitialized(true);
  }, []);

  const initializeDefaultData = () => {
    const defaultCategories: Category[] = [
      // Income categories
      { id: '1', name: 'Salary', icon: '💼', color: '#10B981', type: 'income' },
      { id: '2', name: 'Freelance', icon: '💻', color: '#059669', type: 'income' },
      { id: '3', name: 'Investment', icon: '📈', color: '#047857', type: 'income' },
      { id: '4', name: 'Other Income', icon: '💰', color: '#065F46', type: 'income' },
      
      // Expense categories
      { id: '5', name: 'Food & Dining', icon: '🍽️', color: '#EF4444', type: 'expense' },
      { id: '6', name: 'Transportation', icon: '🚗', color: '#F97316', type: 'expense' },
      { id: '7', name: 'Shopping', icon: '🛍️', color: '#8B5CF6', type: 'expense' },
      { id: '8', name: 'Entertainment', icon: '🎬', color: '#EC4899', type: 'expense' },
      { id: '9', name: 'Bills & Utilities', icon: '⚡', color: '#6B7280', type: 'expense' },
      { id: '10', name: 'Healthcare', icon: '🏥', color: '#DC2626', type: 'expense' },
      { id: '11', name: 'Education', icon: '📚', color: '#2563EB', type: 'expense' },
      { id: '12', name: 'Travel', icon: '✈️', color: '#0891B2', type: 'expense' },
      
      // Transfer categories
      { id: 'transfer-out', name: 'Transfer Out', icon: '↗️', color: '#6B7280', type: 'expense' },
      { id: 'transfer-in', name: 'Transfer In', icon: '↙️', color: '#10B981', type: 'income' },
    ];

    const defaultAccounts: Account[] = [
      {
        id: '1',
        name: 'Main Checking',
        type: 'bank',
        balance: 2500,
        color: '#2563EB',
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Savings',
        type: 'savings',
        balance: 10000,
        color: '#10B981',
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'Cash Wallet',
        type: 'cash',
        balance: 150,
        color: '#F59E0B',
        createdAt: new Date(),
      },
    ];

    dispatch({ type: 'SET_CATEGORIES', payload: defaultCategories });
    dispatch({ type: 'SET_ACCOUNTS', payload: defaultAccounts });
  };

  const getTransactionsWithDetails = (): TransactionWithDetails[] => {
    return state.transactions.map(transaction => {
      const category = state.categories.find(cat => cat.id === transaction.categoryId);
      const account = state.accounts.find(acc => acc.id === transaction.accountId);
      const toAccount = transaction.toAccountId 
        ? state.accounts.find(acc => acc.id === transaction.toAccountId)
        : undefined;

      return {
        ...transaction,
        category: category || state.categories[0],
        account: account || state.accounts[0],
        toAccount,
      };
    });
  };

  const getAccountBalance = (accountId: string): number => {
    const account = state.accounts.find(acc => acc.id === accountId);
    if (!account) return 0;

    const transactions = state.transactions.filter(txn => 
      txn.accountId === accountId || txn.toAccountId === accountId
    );

    let balance = account.balance;
    
    transactions.forEach(txn => {
      if (txn.accountId === accountId) {
        if (txn.type === 'income') {
          balance += txn.amount;
        } else if (txn.type === 'expense') {
          balance -= txn.amount;
        } else if (txn.type === 'transfer') {
          balance -= txn.amount;
        }
      }
      
      if (txn.toAccountId === accountId && txn.type === 'transfer') {
        balance += txn.amount;
      }
    });

    return balance;
  };

  const getTotalBalance = (): number => {
    return state.accounts.reduce((total, account) => {
      return total + getAccountBalance(account.id);
    }, 0);
  };

  const saveData = () => {
    localStorage.setItem('financeData', JSON.stringify(state));
  };

  // Save data whenever state changes
  useEffect(() => {
    if (state.accounts.length > 0 || state.transactions.length > 0) {
      localStorage.setItem('financeData', JSON.stringify(state));
    }
  }, [state]);

  // Apply dark mode
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const value: FinanceContextType = {
    state,
    dispatch,
    getTransactionsWithDetails,
    getAccountBalance,
    getTotalBalance,
    saveData,
  };

  // Show loading state until initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Finance Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};