import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from 'recharts';
import { TransactionWithDetails, DateRange } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

interface TrendAnalysisProps {
  transactions: TransactionWithDetails[];
  dateRange: DateRange;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ 
  transactions, 
  dateRange 
}) => {
  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const monthlyData = transactions.reduce((acc, txn) => {
      const date = new Date(txn.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          net: 0,
          transactions: 0,
        };
      }
      
      if (txn.type === 'income') {
        acc[monthKey].income += txn.amount;
      } else if (txn.type === 'expense') {
        acc[monthKey].expenses += txn.amount;
      }
      
      acc[monthKey].net = acc[monthKey].income - acc[monthKey].expenses;
      acc[monthKey].transactions += 1;
      
      return acc;
    }, {} as Record<string, { month: string; income: number; expenses: number; net: number; transactions: number }>);

    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }, [transactions]);

  // Calculate weekly trends for the last 8 weeks
  const weeklyTrends = useMemo(() => {
    const now = new Date();
    const weeklyData: Record<string, { week: string; income: number; expenses: number; net: number; transactions: number }> = {};
    
    // Initialize last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      const weekKey = formatDate(weekStart);
      
      weeklyData[weekKey] = {
        week: weekKey,
        income: 0,
        expenses: 0,
        net: 0,
        transactions: 0,
      };
    }
    
    // Populate with transaction data
    transactions.forEach(txn => {
      const txnDate = new Date(txn.date);
      const daysSinceNow = Math.floor((now.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceNow <= 56) { // Within last 8 weeks
        const weekIndex = Math.floor(daysSinceNow / 7);
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (weekIndex * 7) - now.getDay());
        const weekKey = formatDate(weekStart);
        
        if (weeklyData[weekKey]) {
          if (txn.type === 'income') {
            weeklyData[weekKey].income += txn.amount;
          } else if (txn.type === 'expense') {
            weeklyData[weekKey].expenses += txn.amount;
          }
          
          weeklyData[weekKey].net = weeklyData[weekKey].income - weeklyData[weekKey].expenses;
          weeklyData[weekKey].transactions += 1;
        }
      }
    });

    return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week));
  }, [transactions]);

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    if (monthlyTrends.length < 2) {
      return {
        incomeGrowth: 0,
        expenseGrowth: 0,
        netGrowth: 0,
        avgMonthlyIncome: 0,
        avgMonthlyExpenses: 0,
        bestMonth: null,
        worstMonth: null,
      };
    }

    const currentMonth = monthlyTrends[monthlyTrends.length - 1];
    const previousMonth = monthlyTrends[monthlyTrends.length - 2];
    
    const incomeGrowth = previousMonth.income > 0 
      ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100 
      : 0;
    
    const expenseGrowth = previousMonth.expenses > 0 
      ? ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100 
      : 0;
    
    const netGrowth = previousMonth.net !== 0 
      ? ((currentMonth.net - previousMonth.net) / Math.abs(previousMonth.net)) * 100 
      : 0;

    const avgMonthlyIncome = monthlyTrends.reduce((sum, month) => sum + month.income, 0) / monthlyTrends.length;
    const avgMonthlyExpenses = monthlyTrends.reduce((sum, month) => sum + month.expenses, 0) / monthlyTrends.length;

    const bestMonth = monthlyTrends.reduce((best, month) => 
      month.net > best.net ? month : best, monthlyTrends[0]
    );
    
    const worstMonth = monthlyTrends.reduce((worst, month) => 
      month.net < worst.net ? month : worst, monthlyTrends[0]
    );

    return {
      incomeGrowth,
      expenseGrowth,
      netGrowth,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      bestMonth,
      worstMonth,
    };
  }, [monthlyTrends]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income Growth</CardTitle>
            {trendStats.incomeGrowth > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              trendStats.incomeGrowth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trendStats.incomeGrowth > 0 ? '+' : ''}{trendStats.incomeGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs previous month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Growth</CardTitle>
            {trendStats.expenseGrowth > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              trendStats.expenseGrowth > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {trendStats.expenseGrowth > 0 ? '+' : ''}{trendStats.expenseGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs previous month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Income</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(trendStats.avgMonthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last {monthlyTrends.length} months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Expenses</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(trendStats.avgMonthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last {monthlyTrends.length} months
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Best/Worst Month Insights */}
      {trendStats.bestMonth && trendStats.worstMonth && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Best Month
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {trendStats.bestMonth.month}: {formatCurrency(trendStats.bestMonth.net)} net income
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Challenging Month
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {trendStats.worstMonth.month}: {formatCurrency(trendStats.worstMonth.net)} net income
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrends.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No monthly trend data available</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="income" fill="#10B981" name="Income" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#2563EB" 
                      strokeWidth={3}
                      name="Net Income"
                      dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Net Income Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyTrends.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No weekly trend data available</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#2563EB" 
                      fill="#2563EB" 
                      fillOpacity={0.3}
                      name="Net Income"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrends.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No monthly data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Month
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Income
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Expenses
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Net Income
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Transactions
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Savings Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrends.map((month, index) => {
                    const savingsRate = month.income > 0 
                      ? ((month.net / month.income) * 100).toFixed(1) 
                      : '0';

                    return (
                      <tr 
                        key={month.month} 
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {month.month}
                        </td>
                        <td className="text-right py-3 px-4 text-green-600 font-medium">
                          {formatCurrency(month.income)}
                        </td>
                        <td className="text-right py-3 px-4 text-red-600 font-medium">
                          {formatCurrency(month.expenses)}
                        </td>
                        <td className={`text-right py-3 px-4 font-medium ${
                          month.net >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(month.net)}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                          {month.transactions}
                        </td>
                        <td className={`text-right py-3 px-4 font-medium ${
                          parseFloat(savingsRate) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {savingsRate}%
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

export default TrendAnalysis;