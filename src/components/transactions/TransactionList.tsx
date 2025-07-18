import React, { useState } from 'react'
import { useFinance } from '../../hooks/useFinance'
import { Transaction } from '../../context/FinanceTypes'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Edit2, Trash2, Calendar, CreditCard, Wallet, Building2, PiggyBank } from 'lucide-react'
import { EditTransactionModal } from './EditTransactionModal'

interface TransactionListProps {
  transactions: Transaction[]
}

const accountTypeIcons = {
  cash: Wallet,
  bank: Building2,
  credit: CreditCard,
  savings: PiggyBank,
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { categories, accounts, deleteTransaction } = useFinance()
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowEditModal(true)
  }

  const handleDeleteTransaction = (transactionId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer.')) {
      deleteTransaction(transactionId)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
          <p className="text-gray-500 text-center">
            No se encontraron transacciones que coincidan con los filtros seleccionados
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const category = categories.find(c => c.id === transaction.categoryId)
        const account = accounts.find(a => a.id === transaction.accountId)
        const AccountIcon = account ? accountTypeIcons[account.type] : Wallet
        const isIncome = transaction.type === 'income'
        
        return (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Category Icon */}
                  <div 
                    className="p-3 rounded-full text-2xl"
                    style={{ backgroundColor: `${category?.color}20` }}
                  >
                    {category?.icon || '💰'}
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {category?.name || 'Categoría desconocida'}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isIncome 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isIncome ? 'Ingreso' : 'Gasto'}
                      </span>
                    </div>
                    
                    {transaction.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {transaction.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <AccountIcon className="w-4 h-4" />
                        <span>{account?.name || 'Cuenta desconocida'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      isIncome ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTransaction(transaction)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Edit Transaction Modal */}
      {selectedTransaction && (
        <EditTransactionModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedTransaction(null)
          }}
          transaction={selectedTransaction}
        />
      )}
    </div>
  )
}