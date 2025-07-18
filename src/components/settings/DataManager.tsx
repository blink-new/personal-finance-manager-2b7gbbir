import React, { useState, useRef } from 'react';
import { useFinance } from '../../hooks/useFinance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { toast } from '../../hooks/use-toast';
import { Upload, Download, RefreshCw, Database, FileText, AlertTriangle } from 'lucide-react';
import { FinanceState } from '../../context/FinanceTypes';

const DataManager: React.FC = () => {
  const { state, dispatch } = useFinance();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    try {
      const dataToExport = {
        ...state,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data exported successfully',
        description: 'Your complete financial data has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your data',
        variant: 'destructive',
      });
    }
  };

  const handleImportData = async (file: File) => {
    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await file.text();
      setImportProgress(25);

      const importedData = JSON.parse(text);
      setImportProgress(50);

      // Validate the imported data structure
      if (!importedData.accounts || !importedData.categories || !importedData.transactions) {
        throw new Error('Invalid data format');
      }

      setImportProgress(75);

      // Process the imported data
      const processedData: FinanceState = {
        accounts: importedData.accounts.map((acc: any) => ({
          ...acc,
          createdAt: new Date(acc.createdAt),
        })),
        categories: importedData.categories,
        transactions: importedData.transactions.map((txn: any) => ({
          ...txn,
          date: new Date(txn.date),
          createdAt: new Date(txn.createdAt),
        })),
        darkMode: importedData.darkMode || false,
      };

      setImportProgress(100);

      // Load the data
      dispatch({ type: 'LOAD_DATA', payload: processedData });

      toast({
        title: 'Data imported successfully',
        description: `Imported ${processedData.accounts.length} accounts, ${processedData.categories.length} categories, and ${processedData.transactions.length} transactions`,
      });
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'The file format is invalid or corrupted',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast({
          title: 'Invalid file type',
          description: 'Please select a JSON file',
          variant: 'destructive',
        });
        return;
      }
      handleImportData(file);
    }
  };

  const handleResetToDefaults = () => {
    // Clear all data first
    dispatch({ type: 'SET_ACCOUNTS', payload: [] });
    dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
    dispatch({ type: 'SET_CATEGORIES', payload: [] });
    
    // Reinitialize with default data
    setTimeout(() => {
      window.location.reload();
    }, 500);

    toast({
      title: 'Reset to defaults',
      description: 'Application will reload with default data',
    });
  };

  const getDataSummary = () => {
    const totalTransactions = state.transactions.length;
    const totalAccounts = state.accounts.length;
    const totalCategories = state.categories.length;
    const oldestTransaction = state.transactions.length > 0 
      ? new Date(Math.min(...state.transactions.map(t => new Date(t.date).getTime())))
      : null;
    const newestTransaction = state.transactions.length > 0
      ? new Date(Math.max(...state.transactions.map(t => new Date(t.date).getTime())))
      : null;

    return {
      totalTransactions,
      totalAccounts,
      totalCategories,
      oldestTransaction,
      newestTransaction,
    };
  };

  const summary = getDataSummary();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Import, export, and manage your financial data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.totalAccounts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.totalTransactions}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.totalCategories}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
          </div>

          {summary.oldestTransaction && summary.newestTransaction && (
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Data Range</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>Oldest transaction: {summary.oldestTransaction.toLocaleDateString()}</div>
                <div>Newest transaction: {summary.newestTransaction.toLocaleDateString()}</div>
                <div>
                  Total span: {Math.ceil((summary.newestTransaction.getTime() - summary.oldestTransaction.getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
            </div>
          )}

          {/* Import Data */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Import Data</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Import financial data from a JSON backup file
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isImporting ? 'Importing...' : 'Import JSON'}
                </Button>
              </div>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing data...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}
          </div>

          {/* Export Data */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Complete Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download all your financial data as a JSON backup file
              </p>
            </div>
            <Button onClick={handleExportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </div>

          {/* Reset to Defaults */}
          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <div>
              <h4 className="font-medium text-orange-900 dark:text-orange-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Reset to Defaults
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Clear all data and restore default categories and sample accounts
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset to Default Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all your current data and restore the application
                    to its initial state with default categories and sample accounts.
                    Make sure to export your data first if you want to keep a backup.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetToDefaults}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Yes, reset to defaults
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Import Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Supported File Format</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Only JSON files exported from this application are supported. The file must contain
              valid account, category, and transaction data.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">What happens during import?</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>All existing data will be replaced with imported data</li>
              <li>Date fields will be automatically converted</li>
              <li>Data integrity will be validated before import</li>
              <li>Invalid files will be rejected with an error message</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Best Practices</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>Always export your current data before importing</li>
              <li>Verify the imported file is from a trusted source</li>
              <li>Check data summary after import to ensure accuracy</li>
              <li>Keep regular backups of your financial data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManager;