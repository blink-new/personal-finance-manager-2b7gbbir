import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TransactionWithDetails, Account } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Wallet, CreditCard, Building, Banknote, TrendingUp } from 'lucide-react';

interface AccountAnalysisProps {
  transactions: TransactionWithDetails[];
  accounts: Account[];
}

const AccountAnalysis: React.FC<AccountAnalysisProps> = ({ 
  transactions, 
  accounts 
}) => {
  // Calculate account activity
  const accountActivity = useMemo(() => {
    const activity = accounts.map(account => {
      const accountTransactions = transactions.filter(txn => 
        txn.accountId === account.id || txn.toAccountId === account.id
      );

      const income = accountTransactions
        .filter(txn => txn.accountId === account.id && txn.type === 'income')
        .reduce((sum, txn) => sum + txn.amount, 0);

      const expenses = accountTransactions
        .filter(txn => txn.accountId === account.id && txn.type === 'expense')
        .reduce((sum, txn) => sum + txn.amount, 0);

      const transfersOut = accountTransactions
        .filter(txn => txn.accountId === account.id && txn.type === 'transfer')
        .reduce((sum, txn) => sum + txn.amount, 0);

      const transfersIn = accountTransactions
        .filter(txn => txn.toAccountId === account.id && txn.type === 'transfer')
        .reduce((sum, txn) => sum + txn.amount, 0);

      const netTransfers = transfersIn - transfersOut;
      const currentBalance = account.balance + income - expenses + netTransfers;
      const totalActivity = income + expenses + transfersOut + transfersIn;

      return {
        ...account,
        income,
        expenses,
        transfersOut,
        transfersIn,
        netTransfers,
        currentBalance,
        totalActivity,
        transactionCount: accountTransactions.length,
      };
    });

    return activity.sort((a, b) => b.totalActivity - a.totalActivity);
  }, [transactions, accounts]);

  // Calculate account type distribution
  const accountTypeDistribution = useMemo(() => {
    const typeData = accountActivity.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = {
          type: account.type,
          balance: 0,
          count: 0,
          color: getAccountTypeColor(account.type),
        };
      }
      acc[account.type].balance += account.currentBalance;
      acc[account.type].count += 1;
      return acc;
    }, {} as Record<string, { type: string; balance: number; count: number; color: string }>);

    return Object.values(typeData);
  }, [accountActivity]);

  const totalBalance = accountActivity.reduce((sum, account) => sum + account.currentBalance, 0);
  const mostActiveAccount = accountActivity.reduce((most, account) => 
    account.totalActivity > most.totalActivity ? account : most, 
    accountActivity[0] || { name: 'None', totalActivity: 0 }
  );

  function getAccountTypeColor(type: string): string {
    const colors = {
      cash: '#F59E0B',
      bank: '#2563EB',
      credit: '#EF4444',
      savings: '#10B981',
      investment: '#8B5CF6',
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  }

  function getAccountTypeIcon(type: string) {
    const icons = {
      cash: Banknote,
      bank: Building,
      credit: CreditCard,
      savings: Wallet,
      investment: TrendingUp,
    };
    const Icon = icons[type as keyof typeof icons] || Wallet;
    return <Icon className="w-4 h-4" />;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            {data.payload.name || data.payload.type}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Balance: {formatCurrency(data.value)}
          </p>
          {data.payload.count && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Accounts: {data.payload.count}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active Account</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {mostActiveAccount.name}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(mostActiveAccount.totalActivity)} total activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Types</CardTitle>
            <Building className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {accountTypeDistribution.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Different account types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Account Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {accountActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No account data available</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accountActivity} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="currentBalance" 
                      fill="#2563EB" 
                      radius={[0, 4, 4, 0]}
                      name="Balance"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Balance by Account Type</CardTitle>
          </CardHeader>
          <CardContent>
            {accountTypeDistribution.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No account type data available</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accountTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="balance"
                    >
                      {accountTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          {accountActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No account data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Account
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Current Balance
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Income
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Expenses
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Net Transfers
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Transactions
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accountActivity.map((account) => (
                    <tr 
                      key={account.id} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: account.color }}
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {getAccountTypeIcon(account.type)}
                              {account.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {account.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`text-right py-3 px-4 font-medium ${
                        account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(account.currentBalance)}
                      </td>
                      <td className="text-right py-3 px-4 text-green-600">
                        {formatCurrency(account.income)}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600">
                        {formatCurrency(account.expenses)}
                      </td>
                      <td className={`text-right py-3 px-4 ${
                        account.netTransfers >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {account.netTransfers >= 0 ? '+' : ''}{formatCurrency(account.netTransfers)}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                        {account.transactionCount}
                      </td>
                      <td className="text-right py-3 px-4 text-blue-600 font-medium">
                        {formatCurrency(account.totalActivity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Type Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Type Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {accountTypeDistribution.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No account type data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accountTypeDistribution.map((typeData) => {
                const percentage = totalBalance > 0 
                  ? ((typeData.balance / totalBalance) * 100).toFixed(1) 
                  : '0';

                return (
                  <Card key={typeData.type} className="border-l-4" style={{ borderLeftColor: typeData.color }}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getAccountTypeIcon(typeData.type)}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {typeData.type}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {typeData.count} account{typeData.count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: typeData.color }}>
                            {formatCurrency(typeData.balance)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {percentage}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountAnalysis;