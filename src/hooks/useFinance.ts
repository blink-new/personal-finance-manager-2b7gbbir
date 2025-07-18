import { useContext } from 'react';
import { FinanceContext } from '../context/context';
import { Account, Transaction } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }

  const { state, dispatch, getTransactionsWithDetails, getAccountBalance, getTotalBalance, saveData } = context;

  // Ensure state is properly initialized with safe defaults
  if (!state || state.accounts === undefined || state.categories === undefined || state.transactions === undefined) {
    return {
      // Safe defaults while loading
      accounts: [],
      categories: [],
      transactions: [],
      darkMode: false,
      addAccount: () => {},
      updateAccount: () => {},
      deleteAccount: () => {},
      addTransaction: () => {},
      updateTransaction: () => {},
      deleteTransaction: () => {},
      getTransactionsWithDetails: () => [],
      getAccountBalance: () => 0,
      getTotalBalance: () => 0,
      saveData: () => {},
      dispatch: () => {},
      isLoading: true,
    };
  }

  // Account management functions
  const addAccount = (accountData: Omit<Account, 'id' | 'createdAt'>) => {
    const account: Account = {
      ...accountData,
      id: generateId(),
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_ACCOUNT', payload: account });
  };

  const updateAccount = (id: string, accountData: Partial<Account>) => {
    const existingAccount = state.accounts.find(a => a.id === id);
    if (existingAccount) {
      const updatedAccount: Account = {
        ...existingAccount,
        ...accountData,
      };
      dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
    }
  };

  const deleteAccount = (id: string) => {
    // Also delete all transactions for this account
    const accountTransactions = state.transactions.filter(t => t.accountId === id || t.toAccountId === id);
    accountTransactions.forEach(t => dispatch({ type: 'DELETE_TRANSACTION', payload: t.id }));
    dispatch({ type: 'DELETE_ACCOUNT', payload: id });
  };

  // Transaction management functions
  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transaction: Transaction = {
      ...transactionData,
      id: generateId(),
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  };

  const updateTransaction = (id: string, transactionData: Partial<Transaction>) => {
    const existingTransaction = state.transactions.find(t => t.id === id);
    if (existingTransaction) {
      const updatedTransaction: Transaction = {
        ...existingTransaction,
        ...transactionData,
      };
      dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
    }
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  return {
    // State
    accounts: state.accounts || [],
    categories: state.categories || [],
    transactions: state.transactions || [],
    darkMode: state.darkMode ?? false,

    // Account functions
    addAccount,
    updateAccount,
    deleteAccount,

    // Transaction functions
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Utility functions
    getTransactionsWithDetails,
    getAccountBalance,
    getTotalBalance,
    saveData,

    // Other actions
    dispatch,
    isLoading: false,
  };
};