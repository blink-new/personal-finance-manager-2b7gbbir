import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TransactionWithDetails, Category, DateRange } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface ExpenseAnalysisProps {
  transactions: TransactionWithDetails[];
  dateRange: DateRange;
  categories: Category[];
}

const ExpenseAnalysis: React.FC<ExpenseAnalysisProps> = ({ 
  transactions, 
  dateRange, 
  categories 
}) => {
  const expenseTransactions = transactions.filter(txn => txn.type === 'expense');

  // Calculate top spending categories
  const topCategories = useMemo(() => {
    const categoryTotals = expenseTransactions.reduce((acc, txn) => {
      const categoryName = txn.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          amount: 0,
          count: 0,
          color: txn.category.color,
        };
      }
      acc[categoryName].amount += txn.amount;
      acc[categoryName].count += 1;
      return acc;
    }, {} as Record<string, { name: string; amount: number; count: number; color: string }>);

    return Object.values(categoryTotals)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [expenseTransactions]);

  // Calculate daily spending trend
  const dailySpending = useMemo(() => {
    const dailyTotals = expenseTransactions.reduce((acc, txn) => {
      const dateKey = formatDate(txn.date);
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          amount: 0,
          count: 0,
        };
      }
      acc[dateKey].amount += txn.amount;
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, { date: string; amount: number; count: number }>);

    return Object.values(dailyTotals)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenseTransactions]);

  // Calculate statistics
  const totalExpenses = expenseTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const averageTransaction = expenseTransactions.length > 0 
    ? totalExpenses / expenseTransactions.length 
    : 0;
  const averageDaily = dailySpending.length > 0 
    ? totalExpenses / dailySpending.length 
    : 0;

  // Find highest spending day
  const highestSpendingDay = dailySpending.reduce((max, day) => 
    day.amount > max.amount ? day : max, 
    { date: '', amount: 0, count: 0 }
  );

  // Calculate spending trend (comparing first half vs second half)
  const midPoint = Math.floor(dailySpending.length / 2);
  const firstHalf = dailySpending.slice(0, midPoint);
  const secondHalf = dailySpending.slice(midPoint);
  
  const firstHalfAvg = firstHalf.length > 0 
    ? firstHalf.reduce((sum, day) => sum + day.amount, 0) / firstHalf.length 
    : 0;
  const secondHalfAvg = secondHalf.length > 0 
    ? secondHalf.reduce((sum, day) => sum + day.amount, 0) / secondHalf.length 
    : 0;
  
  const trendPercentage = firstHalfAvg > 0 
    ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-red-600">
            Amount: {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.count && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transactions: {payload[0].payload.count}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenseTransactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Transaction</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(averageTransaction)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(averageDaily)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spending Trend</CardTitle>
            {trendPercentage > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              trendPercentage > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {trendPercentage > 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Highest Spending Alert */}
      {highestSpendingDay.amount > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Highest Spending Day
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {highestSpendingDay.date}: {formatCurrency(highestSpendingDay.amount)} 
                  ({highestSpendingDay.count} transactions)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No expense data available</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCategories} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" fill="#EF4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {dailySpending.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No daily spending data available</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {topCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No category data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Category
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Amount
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Transactions
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Avg per Transaction
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topCategories.map((category, index) => {
                    const percentage = totalExpenses > 0 
                      ? ((category.amount / totalExpenses) * 100).toFixed(1) 
                      : '0';
                    const avgPerTransaction = category.count > 0 
                      ? category.amount / category.count 
                      : 0;

                    return (
                      <tr 
                        key={category.name} 
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-medium text-red-600">
                          {formatCurrency(category.amount)}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                          {category.count}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                          {formatCurrency(avgPerTransaction)}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseAnalysis;