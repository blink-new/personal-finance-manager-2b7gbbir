import React, { useState } from 'react';
import { useFinance } from '../../hooks/useFinance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { toast } from '../../hooks/use-toast';
import { Plus, Edit, Trash2, CreditCard, Wallet, PiggyBank, Building } from 'lucide-react';
import { Account } from '../../types';
import { formatCurrency } from '../../utils/formatters';

const AccountsManager: React.FC = () => {
  const { state, dispatch, getAccountBalance } = useFinance();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'bank' as Account['type'],
    balance: 0,
    color: '#2563EB'
  });

  const accountTypeIcons = {
    bank: Building,
    savings: PiggyBank,
    credit: CreditCard,
    cash: Wallet,
    investment: Building,
  };

  const accountTypeLabels = {
    bank: 'Bank Account',
    savings: 'Savings Account',
    credit: 'Credit Card',
    cash: 'Cash',
    investment: 'Investment Account',
  };

  const predefinedColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937'
  ];

  const handleAddAccount = () => {
    if (!newAccount.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter an account name',
        variant: 'destructive',
      });
      return;
    }

    const account: Account = {
      id: Date.now().toString(),
      name: newAccount.name.trim(),
      type: newAccount.type,
      balance: newAccount.balance,
      color: newAccount.color,
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_ACCOUNT', payload: account });
    setNewAccount({ name: '', type: 'bank', balance: 0, color: '#2563EB' });
    setShowAddDialog(false);
    
    toast({
      title: 'Account added',
      description: `${account.name} has been added to your accounts`,
    });
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setNewAccount({
      name: account.name,
      type: account.type,
      balance: account.balance,
      color: account.color,
    });
  };

  const handleUpdateAccount = () => {
    if (!editingAccount || !newAccount.name.trim()) return;

    const updatedAccount: Account = {
      ...editingAccount,
      name: newAccount.name.trim(),
      type: newAccount.type,
      balance: newAccount.balance,
      color: newAccount.color,
    };

    dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
    setEditingAccount(null);
    setNewAccount({ name: '', type: 'bank', balance: 0, color: '#2563EB' });
    
    toast({
      title: 'Account updated',
      description: `${updatedAccount.name} has been updated`,
    });
  };

  const handleDeleteAccount = (accountId: string) => {
    const account = state.accounts.find(acc => acc.id === accountId);
    if (!account) return;

    // Check if account is being used
    const isUsed = state.transactions.some(txn => 
      txn.accountId === accountId || txn.toAccountId === accountId
    );
    
    if (isUsed) {
      toast({
        title: 'Cannot delete account',
        description: 'This account is being used by existing transactions',
        variant: 'destructive',
      });
      return;
    }

    dispatch({ type: 'DELETE_ACCOUNT', payload: accountId });
    
    toast({
      title: 'Account deleted',
      description: `${account.name} has been removed`,
    });
  };

  const getAccountTransactionCount = (accountId: string) => {
    return state.transactions.filter(txn => 
      txn.accountId === accountId || txn.toAccountId === accountId
    ).length;
  };

  const getAccountsByType = (type: Account['type']) => {
    return state.accounts.filter(acc => acc.type === type);
  };

  const accountTypes: Account['type'][] = ['bank', 'savings', 'credit', 'cash', 'investment'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Accounts Management
              </CardTitle>
              <CardDescription>
                Manage your financial accounts and their settings
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                      id="name"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      placeholder="Enter account name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select
                      value={newAccount.type}
                      onValueChange={(value: Account['type']) => 
                        setNewAccount({ ...newAccount, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {accountTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="balance">Initial Balance</Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="grid grid-cols-10 gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewAccount({ ...newAccount, color })}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newAccount.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddAccount}>
                      Add Account
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {accountTypes.map((type) => {
              const accounts = getAccountsByType(type);
              if (accounts.length === 0) return null;

              const IconComponent = accountTypeIcons[type];

              return (
                <div key={type}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    {accountTypeLabels[type]} ({accounts.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {accounts.map((account) => {
                      const currentBalance = getAccountBalance(account.id);
                      const transactionCount = getAccountTransactionCount(account.id);

                      return (
                        <div
                          key={account.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: account.color }}
                              />
                              <div>
                                <div className="font-medium">{account.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {transactionCount} transactions
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAccount(account)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{account.name}"? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteAccount(account.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Initial Balance:
                              </span>
                              <span className="font-medium">
                                {formatCurrency(account.balance)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Current Balance:
                              </span>
                              <span className={`font-bold ${
                                currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(currentBalance)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Net Change:
                              </span>
                              <Badge variant={currentBalance >= account.balance ? 'default' : 'destructive'}>
                                {currentBalance >= account.balance ? '+' : ''}
                                {formatCurrency(currentBalance - account.balance)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Account Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Account Name</Label>
              <Input
                id="edit-name"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder="Enter account name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select
                value={newAccount.type}
                onValueChange={(value: Account['type']) => 
                  setNewAccount({ ...newAccount, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {accountTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-balance">Initial Balance</Label>
              <Input
                id="edit-balance"
                type="number"
                step="0.01"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-10 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewAccount({ ...newAccount, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newAccount.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingAccount(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAccount}>
                Update Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountsManager;