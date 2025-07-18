import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Account } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface AccountCardProps {
  account: Account;
  balance: number;
  onClick?: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, balance, onClick }) => {
  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'bank':
        return '🏦';
      case 'cash':
        return '💵';
      case 'credit':
        return '💳';
      case 'savings':
        return '🏛️';
      case 'investment':
        return '📈';
      default:
        return '💰';
    }
  };

  const getAccountTypeLabel = (type: Account['type']) => {
    switch (type) {
      case 'bank':
        return 'Bank Account';
      case 'cash':
        return 'Cash';
      case 'credit':
        return 'Credit Card';
      case 'savings':
        return 'Savings';
      case 'investment':
        return 'Investment';
      default:
        return 'Account';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        onClick ? 'hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getAccountIcon(account.type)}</span>
            <span className="text-gray-600 dark:text-gray-400">
              {getAccountTypeLabel(account.type)}
            </span>
          </div>
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: account.color }}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {account.name}
          </h3>
          <p className={`text-2xl font-bold ${
            balance >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCard;