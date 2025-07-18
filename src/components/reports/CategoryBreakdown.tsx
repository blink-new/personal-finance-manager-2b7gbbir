import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TransactionWithDetails } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CategoryBreakdownProps {
  transactions: TransactionWithDetails[];
  type: 'income' | 'expense';
  title: string;
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ 
  transactions, 
  type, 
  title 
}) => {
  // Filter transactions by type
  const filteredTransactions = transactions.filter(txn => txn.type === type);

  // Group by category
  const categoryData = filteredTransactions.reduce((acc, txn) => {
    const categoryName = txn.category.name;
    const categoryColor = txn.category.color;
    
    if (!acc[categoryName]) {
      acc[categoryName] = {
        name: categoryName,
        value: 0,
        color: categoryColor,
        count: 0,
      };
    }
    
    acc[categoryName].value += txn.amount;
    acc[categoryName].count += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number; color: string; count: number }>);

  const chartData = Object.values(categoryData).sort((a, b) => b.value - a.value);
  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalAmount > 0 ? ((data.value / totalAmount) * 100).toFixed(1) : '0';
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            {data.payload.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Amount: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Percentage: {percentage}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Transactions: {data.payload.count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {formatCurrency(totalAmount)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No {type} transactions found</p>
            <p className="text-sm mt-1">
              {type === 'expense' ? 'Start tracking your expenses' : 'Add some income transactions'} to see insights
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category List */}
            <div className="space-y-2">
              {chartData.slice(0, 5).map((category, index) => {
                const percentage = totalAmount > 0 ? ((category.value / totalAmount) * 100).toFixed(1) : '0';
                
                return (
                  <div key={category.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(category.value)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage}% • {category.count} transactions
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {chartData.length > 5 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    +{chartData.length - 5} more categories
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;