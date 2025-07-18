import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import TransactionForm from './components/transactions/TransactionForm';
import { TransactionsPage } from './components/transactions/TransactionsPage';
import { AccountsPage } from './components/accounts/AccountsPage';
import ReportsPage from './components/reports/ReportsPage';
import SettingsPage from './components/settings/SettingsPage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const handleAddTransaction = () => {
    setShowTransactionForm(true);
  };

  const handleTransactionSuccess = () => {
    setShowTransactionForm(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAddTransaction={handleAddTransaction} />;
      case 'add-transaction':
        setActiveTab('dashboard');
        setShowTransactionForm(true);
        return <Dashboard onAddTransaction={handleAddTransaction} />;
      case 'transactions':
        return (
          <div className="p-6">
            <TransactionsPage />
          </div>
        );
      case 'accounts':
        return (
          <div className="p-6">
            <AccountsPage />
          </div>
        );
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onAddTransaction={handleAddTransaction} />;
    }
  };

  return (
    <FinanceProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>

        {/* Transaction Form Modal */}
        <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm
              onClose={() => setShowTransactionForm(false)}
              onSuccess={handleTransactionSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
    </FinanceProvider>
  );
}

export default App;