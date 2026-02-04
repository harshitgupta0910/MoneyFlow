import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { 
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, 
  isWithinInterval, format 
} from 'date-fns';

const MoneyContext = createContext(undefined);

export function MoneyProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all data on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchAllData();
    }
  }, [isAuthenticated, authLoading]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [txRes, accRes, catRes] = await Promise.all([
        axios.get('/transactions'),
        axios.get('/accounts'),
        axios.get('/categories')
      ]);
      
      setTransactions(txRes.data.map(tx => ({
        ...tx,
        dateTime: new Date(tx.dateTime),
        createdAt: tx.createdAt ? new Date(tx.createdAt) : null
      })));
      setAccounts(accRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEditTransaction = useCallback((transaction) => {
    if (!transaction.createdAt) {
      // If no createdAt, assume it's old and can't be edited
      return false;
    }
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const createdDate = new Date(transaction.createdAt);
    return createdDate >= twelveHoursAgo;
  }, []);

  const addTransaction = useCallback(async (transaction) => {
    try {
      const response = await axios.post('/transactions', {
        ...transaction,
        dateTime: transaction.dateTime || new Date()
      });
      
      const newTransaction = {
        ...response.data,
        dateTime: new Date(response.data.dateTime),
        createdAt: new Date(response.data.createdAt)
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Refresh accounts to get updated balances
      const accRes = await axios.get('/accounts');
      setAccounts(accRes.data);
      
      return newTransaction;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  }, []);

  const updateTransaction = useCallback(async (id, updates) => {
    try {
      const response = await axios.put(`/transactions/${id}`, updates);
      
      setTransactions(prev => prev.map(tx => 
        tx._id === id ? {
          ...response.data,
          dateTime: new Date(response.data.dateTime),
          createdAt: new Date(response.data.createdAt)
        } : tx
      ));
      
      // Refresh accounts
      const accRes = await axios.get('/accounts');
      setAccounts(accRes.data);
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await axios.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(tx => tx._id !== id));
      
      // Refresh accounts
      const accRes = await axios.get('/accounts');
      setAccounts(accRes.data);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  }, []);

  const addAccount = useCallback(async (account) => {
    try {
      const response = await axios.post('/accounts', account);
      setAccounts(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Failed to add account:', error);
      throw error;
    }
  }, []);

  const updateAccount = useCallback(async (id, updates) => {
    try {
      const response = await axios.put(`/accounts/${id}`, updates);
      setAccounts(prev => prev.map(acc => 
        acc._id === id ? response.data : acc
      ));
    } catch (error) {
      console.error('Failed to update account:', error);
      throw error;
    }
  }, []);

  const deleteAccount = useCallback(async (id) => {
    try {
      await axios.delete(`/accounts/${id}`);
      setAccounts(prev => prev.filter(acc => acc._id !== id));
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }, []);

  const transferMoney = useCallback(async (transfer) => {
    try {
      await axios.post('/accounts/transfer', transfer);
      
      // Refresh both accounts and transactions to get the new transfer record
      const [accRes, txRes] = await Promise.all([
        axios.get('/accounts'),
        axios.get('/transactions')
      ]);
      
      setAccounts(accRes.data);
      setTransactions(txRes.data.map(tx => ({
        ...tx,
        dateTime: new Date(tx.dateTime),
        createdAt: tx.createdAt ? new Date(tx.createdAt) : null
      })));
    } catch (error) {
      console.error('Failed to transfer money:', error);
      throw error;
    }
  }, []);

  const addCategory = useCallback(async (category) => {
    try {
      const response = await axios.post('/categories', category);
      setCategories(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  }, []);

  const getFilteredTransactions = useCallback((filters) => {
    return transactions.filter(tx => {
      if (filters.category && tx.category !== filters.category) return false;
      if (filters.division && tx.division !== filters.division) return false;
      if (filters.type && tx.type !== filters.type) return false;
      if (filters.account && tx.account !== filters.account) return false;
      if (filters.dateRange) {
        if (!isWithinInterval(new Date(tx.dateTime), { 
          start: filters.dateRange.start, 
          end: filters.dateRange.end 
        })) {
          return false;
        }
      }
      return true;
    });
  }, [transactions]);

  const getPeriodRange = useCallback((period) => {
    const now = new Date();
    switch (period) {
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: startOfYear(now), end: now };
    }
  }, []);

  const getIncomeTotal = useCallback((period) => {
    let filtered = transactions.filter(tx => tx.type === 'income');
    if (period) {
      const range = getPeriodRange(period);
      filtered = filtered.filter(tx => isWithinInterval(new Date(tx.dateTime), range));
    }
    return filtered.reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, getPeriodRange]);

  const getExpenseTotal = useCallback((period) => {
    let filtered = transactions.filter(tx => tx.type === 'expense');
    if (period) {
      const range = getPeriodRange(period);
      filtered = filtered.filter(tx => isWithinInterval(new Date(tx.dateTime), range));
    }
    return filtered.reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, getPeriodRange]);

  const getChartData = useCallback((period) => {
    const data = [];
    const now = new Date();

    if (period === 'week') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.forEach((day, index) => {
        const dayDate = new Date(startOfWeek(now));
        dayDate.setDate(dayDate.getDate() + index);
        
        const dayTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.dateTime);
          return txDate.toDateString() === dayDate.toDateString();
        });
        
        data.push({
          name: day,
          income: dayTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
          expense: dayTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0),
        });
      });
    } else if (period === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const weekCount = Math.ceil(daysInMonth / 7);
      
      for (let week = 0; week < weekCount; week++) {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), week * 7 + 1);
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), Math.min((week + 1) * 7, daysInMonth));
        
        const weekTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.dateTime);
          return txDate >= weekStart && txDate <= weekEnd;
        });
        
        data.push({
          name: `Week ${week + 1}`,
          income: weekTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
          expense: weekTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0),
        });
      }
    } else if (period === 'year') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach((month, index) => {
        const monthStart = new Date(now.getFullYear(), index, 1);
        const monthEnd = new Date(now.getFullYear(), index + 1, 0);
        
        const monthTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.dateTime);
          return txDate >= monthStart && txDate <= monthEnd;
        });
        
        data.push({
          name: month,
          income: monthTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
          expense: monthTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0),
        });
      });
    }

    return data;
  }, [transactions]);

  const getCategoryData = useCallback((type, period) => {
    let filtered = transactions.filter(tx => tx.type === type);
    
    if (period) {
      const range = getPeriodRange(period);
      filtered = filtered.filter(tx => isWithinInterval(new Date(tx.dateTime), range));
    }

    const categoryTotals = {};
    filtered.forEach(tx => {
      if (!categoryTotals[tx.category]) {
        const category = categories.find(c => c.name === tx.category);
        categoryTotals[tx.category] = {
          name: tx.category,
          value: 0,
          color: category?.color || 'hsl(0, 0%, 50%)',
        };
      }
      categoryTotals[tx.category].value += tx.amount;
    });

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value);
  }, [transactions, categories, getPeriodRange]);

  const value = {
    transactions,
    accounts,
    categories,
    loading,
    divisions: [
      { id: '1', name: 'Personal' },
      { id: '2', name: 'Business' },
      { id: '3', name: 'Family' },
      { id: '4', name: 'Savings' },
    ],
    canEditTransaction,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    transferMoney,
    addCategory,
    getFilteredTransactions,
    getIncomeTotal,
    getExpenseTotal,
    getChartData,
    getCategoryData,
    refreshData: fetchAllData,
  };

  return (
    <MoneyContext.Provider value={value}>
      {children}
    </MoneyContext.Provider>
  );
}

export function useMoney() {
  const context = useContext(MoneyContext);
  if (context === undefined) {
    throw new Error('useMoney must be used within a MoneyProvider');
  }
  return context;
}
