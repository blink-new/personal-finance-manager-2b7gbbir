import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Download, TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DateRange } from '../../types';
import ExpenseAnalysis from './ExpenseAnalysis';
import IncomeAnalysis from './IncomeAnalysis';
import TrendAnalysis from './TrendAnalysis';
import AccountAnalysis from './AccountAnalysis';
import CategoryBreakdown from './CategoryBreakdown';
import { exportToCSV } from '../../utils/exportUtils';

const ReportsPage: React.FC = () => {
  const { getTransactionsWithDetails, accounts, categories } = useFinance();
  const [dateRange, setDateRange] = useState<DateRange>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');

  const transactions = getTransactionsWithDetails();

  // Calculate date range for filtering
  const getDateRangeFilter = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (dateRange) {
      case 'daily':
        if (selectedPeriod === 'current') {
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
        } else {
          startDate.setDate(now.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setDate(now.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      case 'weekly': {
        const dayOfWeek = now.getDay();
        if (selectedPeriod === 'current') {
          startDate.setDate(now.getDate() - dayOfWeek);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
        } else {
          startDate.setDate(now.getDate() - dayOfWeek - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate.setDate(now.getDate() - dayOfWeek - 1);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      }
      case 'monthly':
        if (selectedPeriod === 'current') {
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setMonth(now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
        } else {
          startDate.setMonth(now.getMonth() - 1, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setMonth(now.getMonth(), 0);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      case 'yearly':
        if (selectedPeriod === 'current') {
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setMonth(11, 31);
          endDate.setHours(23, 59, 59, 999);
        } else {
          startDate.setFullYear(now.getFullYear() - 1, 0, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setFullYear(now.getFullYear() - 1, 11, 31);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    return { startDate, endDate };
  }, [dateRange, selectedPeriod]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    const { startDate, endDate } = getDateRangeFilter;
    return transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate >= startDate && txnDate <= endDate;
    });
  }, [transactions, getDateRangeFilter]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const income = filteredTransactions
      .filter(txn => txn.type === 'income')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const expenses = filteredTransactions
      .filter(txn => txn.type === 'expense')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const transfers = filteredTransactions
      .filter(txn => txn.type === 'transfer')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const netIncome = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return {
      income,
      expenses,
      transfers,
      netIncome,
      savingsRate,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const handleExportData = () => {
    const dataToExport = filteredTransactions.map(txn => ({
      Date: formatDate(txn.date),
      Type: txn.type,
      Amount: txn.amount,
      Category: txn.category.name,
      Account: txn.account.name,
      'To Account': txn.toAccount?.name || '',
      Description: txn.description || '',
    }));

    const filename = `financial-report-${dateRange}-${formatDate(new Date())}.csv`;
    exportToCSV(dataToExport, filename);
  };

  const getPeriodLabel = () => {
    const { startDate, endDate } = getDateRangeFilter;
    if (dateRange === 'daily') {
      return formatDate(startDate);
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financial Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analyze your financial data with detailed insights and trends
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="previous">Previous</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Showing data for: {getPeriodLabel()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summaryStats.income)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summaryStats.expenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className={`h-4 w-4 ${summaryStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              summaryStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(summaryStats.netIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <PieChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summaryStats.savingsRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {summaryStats.transactionCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryBreakdown 
              transactions={filteredTransactions} 
              type="expense" 
              title="Expense Breakdown"
            />
            <CategoryBreakdown 
              transactions={filteredTransactions} 
              type="income" 
              title="Income Sources"
            />
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseAnalysis 
            transactions={filteredTransactions}
            dateRange={dateRange}
            categories={categories}
          />
        </TabsContent>

        <TabsContent value="income">
          <IncomeAnalysis 
            transactions={filteredTransactions}
            dateRange={dateRange}
            categories={categories}
          />
        </TabsContent>

        <TabsContent value="trends">
          <TrendAnalysis 
            transactions={transactions}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="accounts">
          <AccountAnalysis 
            transactions={filteredTransactions}
            accounts={accounts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;