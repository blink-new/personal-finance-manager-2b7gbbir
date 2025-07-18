import React, { useState } from 'react';
import { useFinance } from '../../hooks/useFinance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { toast } from '../../hooks/use-toast';
import { 
  Settings, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Trash2, 
  Shield, 
  Database, 
  Palette,
  Bell,
  Globe,
  User,
  CreditCard,
  FileText,
  HelpCircle
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import CategoriesManager from './CategoriesManager';
import AccountsManager from './AccountsManager';
import DataManager from './DataManager';

const SettingsPage: React.FC = () => {
  const { state, dispatch, getTransactionsWithDetails } = useFinance();
  const [activeTab, setActiveTab] = useState('general');

  const handleToggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
    toast({
      title: state.darkMode ? 'Light mode enabled' : 'Dark mode enabled',
      description: `Switched to ${state.darkMode ? 'light' : 'dark'} theme`,
    });
  };

  const handleExportData = () => {
    try {
      const transactions = getTransactionsWithDetails();
      exportToCSV(transactions, state.accounts, state.categories);
      toast({
        title: 'Data exported successfully',
        description: 'Your financial data has been downloaded as CSV files',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your data',
        variant: 'destructive',
      });
    }
  };

  const handleClearAllData = () => {
    dispatch({ type: 'SET_ACCOUNTS', payload: [] });
    dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
    dispatch({ type: 'SET_CATEGORIES', payload: [] });
    localStorage.removeItem('financeData');
    toast({
      title: 'All data cleared',
      description: 'Your financial data has been permanently deleted',
    });
  };

  const getStorageUsage = () => {
    const data = localStorage.getItem('financeData');
    if (!data) return '0 KB';
    const bytes = new Blob([data]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your preferences, data, and application settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            About
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Switch between light and dark themes
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    checked={state.darkMode}
                    onCheckedChange={handleToggleDarkMode}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Transaction Alerts</Label>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when transactions are added
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Budget Warnings</Label>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Alert when approaching spending limits
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Monthly Reports</Label>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Receive monthly financial summaries
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>
                Configure currency and regional preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" defaultValue="USD" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input id="language" defaultValue="English" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Input id="dateFormat" defaultValue="MM/DD/YYYY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="UTC-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Management */}
        <TabsContent value="categories">
          <CategoriesManager />
        </TabsContent>

        {/* Accounts Management */}
        <TabsContent value="accounts">
          <AccountsManager />
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-6">
          <DataManager />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
              <CardDescription>
                Download your financial data for backup or analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Complete Financial Data</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Export all transactions, accounts, and categories as CSV files
                    </p>
                  </div>
                  <Button onClick={handleExportData} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that will permanently delete your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800">
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100">Clear All Data</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      This will permanently delete all your financial data
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all your
                          accounts, transactions, and categories. Make sure to export your data
                          first if you want to keep a backup.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearAllData}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, delete everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Version
                  </Label>
                  <p className="text-lg font-semibold">1.0.0</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Build Date
                  </Label>
                  <p className="text-lg font-semibold">January 2024</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Storage Usage
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getStorageUsage()}</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    of local storage used
                  </span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Data Summary
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{state.accounts.length}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Accounts</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{state.transactions.length}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Transactions</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{state.categories.length}</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Categories</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Data Storage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All your financial data is stored locally in your browser. No data is sent to external servers.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Privacy</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This application respects your privacy. Your financial information never leaves your device.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Security</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Data is stored using browser's localStorage with no external connections required.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;