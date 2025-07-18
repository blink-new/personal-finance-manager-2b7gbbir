import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TransactionWithDetails, Category, DateRange } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface IncomeAnalysisProps {
  transactions: TransactionWithDetails[];
  dateRange: DateRange;
  categories: Category[];
}

const IncomeAnalysis: React.FC<IncomeAnalysisProps> = ({ 
  transactions, 
  dateRange, 
  categories 
}) => {
  const incomeTransactions = transactions.filter(txn => txn.type === 'income');

  // Calculate top income sources
  const topSources = useMemo(() => {
    const sourceTotals = incomeTransactions.reduce((acc, txn) => {
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

    return Object.values(sourceTotals)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [incomeTransactions]);

  // Calculate daily income trend
  const dailyIncome = useMemo(() => {
    const dailyTotals = incomeTransactions.reduce((acc, txn) => {
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
  }, [incomeTransactions]);

  // Calculate statistics
  const totalIncome = incomeTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const averageTransaction = incomeTransactions.length > 0 
    ? totalIncome / incomeTransactions.length 
    : 0;
  const averageDaily = dailyIncome.length > 0 
    ? totalIncome / dailyIncome.length 
    : 0;

  // Find highest income day
  const highestIncomeDay = dailyIncome.reduce((max, day) => 
    day.amount > max.amount ? day : max, 
    { date: '', amount: 0, count: 0 }
  );

  // Calculate income trend (comparing first half vs second half)
  const midPoint = Math.floor(dailyIncome.length / 2);
  const firstHalf = dailyIncome.slice(0, midPoint);
  const secondHalf = dailyIncome.slice(midPoint);
  
  const firstHalfAvg = firstHalf.length > 0 
    ? firstHalf.reduce((sum, day) => sum + day.amount, 0) / firstHalf.length 
    : 0;
  const secondHalfAvg = secondHalf.length > 0 
    ? secondHalf.reduce((sum, day) => sum + day.amount, 0) / secondHalf.length 
    : 0;
  
  const trendPercentage = firstHalfAvg > 0 
    ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 
    : 0;

  // Calculate income diversity (number of different sources)
  const incomeDiversity = topSources.length;
  const primarySourcePercentage = totalIncome > 0 && topSources.length > 0
    ? ((topSources[0].amount / totalIncome) * 100).toFixed(1)
    : '0';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-green-600">
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
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {incomeTransactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Transaction</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(averageTransaction)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(averageDaily)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income Trend</CardTitle>
            {trendPercentage > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              trendPercentage > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trendPercentage > 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Primary Income Source
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {topSources.length > 0 ? topSources[0].name : 'No income recorded'}: {primarySourcePercentage}% of total income
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Income Diversity
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {incomeDiversity} different income sources
                  {highestIncomeDay.amount > 0 && (
                    <span> • Best day: {formatCurrency(highestIncomeDay.amount)}</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Income Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Top Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {topSources.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No income data available</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSources} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Income Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Income Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyIncome.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No daily income data available</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyIncome}>
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
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Income Sources Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Income Sources Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {topSources.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No income source data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Source
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
                  {topSources.map((source, index) => {
                    const percentage = totalIncome > 0 
                      ? ((source.amount / totalIncome) * 100).toFixed(1) 
                      : '0';
                    const avgPerTransaction = source.count > 0 
                      ? source.amount / source.count 
                      : 0;

                    return (
                      <tr 
                        key={source.name} 
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: source.color }}
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {source.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-medium text-green-600">
                          {formatCurrency(source.amount)}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                          {source.count}
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

export default IncomeAnalysis;