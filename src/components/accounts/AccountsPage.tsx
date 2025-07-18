import React, { useState } from 'react'
import { useFinance } from '../../hooks/useFinance'
import { Account } from '../../context/FinanceTypes'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Plus, Edit2, Trash2, ArrowRightLeft, CreditCard, Wallet, Building2, PiggyBank } from 'lucide-react'
import { AddAccountModal } from './AddAccountModal'
import { EditAccountModal } from './EditAccountModal'
import { TransferModal } from './TransferModal'

const accountTypeIcons = {
  cash: Wallet,
  bank: Building2,
  credit: CreditCard,
  savings: PiggyBank,
}

const accountTypeLabels = {
  cash: 'Efectivo',
  bank: 'Cuenta Bancaria',
  credit: 'Tarjeta de Crédito',
  savings: 'Ahorros',
}

export function AccountsPage() {
  const { accounts, deleteAccount } = useFinance()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account)
    setShowEditModal(true)
  }

  const handleDeleteAccount = (accountId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cuenta? Esta acción no se puede deshacer.')) {
      deleteAccount(accountId)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cuentas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus cuentas financieras</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowTransferModal(true)} variant="outline">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Transferir
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardHeader>
          <CardTitle className="text-white/90">Balance Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-blue-100 mt-1">{accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}</p>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cuentas</h3>
            <p className="text-gray-500 text-center mb-6">
              Crea tu primera cuenta para comenzar a gestionar tus finanzas
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Cuenta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const IconComponent = accountTypeIcons[account.type]
            const isNegative = account.balance < 0
            
            return (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${account.color}20`, color: account.color }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {accountTypeLabels[account.type]}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Balance</span>
                      <span 
                        className={`text-xl font-bold ${
                          isNegative ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                    {account.description && (
                      <p className="text-sm text-gray-600 mt-2">{account.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <AddAccountModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
      
      {selectedAccount && (
        <EditAccountModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedAccount(null)
          }}
          account={selectedAccount}
        />
      )}
      
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
      />
    </div>
  )
}