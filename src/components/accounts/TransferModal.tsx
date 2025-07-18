import React, { useState } from 'react'
import { useFinance } from '../../hooks/useFinance'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { ArrowRightLeft, CreditCard, Wallet, Building2, PiggyBank } from 'lucide-react'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
}

const accountTypeIcons = {
  cash: Wallet,
  bank: Building2,
  credit: CreditCard,
  savings: PiggyBank,
}

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const { accounts, addTransaction } = useFinance()
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fromAccountId || !formData.toAccountId) {
      alert('Debes seleccionar ambas cuentas')
      return
    }

    if (formData.fromAccountId === formData.toAccountId) {
      alert('No puedes transferir a la misma cuenta')
      return
    }

    const amount = parseFloat(formData.amount)
    if (!amount || amount <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }

    const fromAccount = accounts.find(acc => acc.id === formData.fromAccountId)
    const toAccount = accounts.find(acc => acc.id === formData.toAccountId)

    if (!fromAccount || !toAccount) {
      alert('Cuentas no encontradas')
      return
    }

    // Create transfer transactions
    const transferDescription = formData.description || `Transferencia de ${fromAccount.name} a ${toAccount.name}`
    
    // Outgoing transaction (expense from source account)
    addTransaction({
      type: 'expense',
      amount: amount,
      categoryId: 'transfer-out',
      accountId: formData.fromAccountId,
      description: transferDescription,
      date: new Date().toISOString().split('T')[0]
    })

    // Incoming transaction (income to destination account)
    addTransaction({
      type: 'income',
      amount: amount,
      categoryId: 'transfer-in',
      accountId: formData.toAccountId,
      description: transferDescription,
      date: new Date().toISOString().split('T')[0]
    })

    // Reset form
    setFormData({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      description: ''
    })
    
    onClose()
  }

  const handleClose = () => {
    setFormData({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      description: ''
    })
    onClose()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const fromAccount = accounts.find(acc => acc.id === formData.fromAccountId)
  const toAccount = accounts.find(acc => acc.id === formData.toAccountId)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5" />
            <span>Transferir Dinero</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromAccount">Cuenta origen *</Label>
            <Select value={formData.fromAccountId} onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona cuenta origen" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => {
                  const IconComponent = accountTypeIcons[account.type]
                  return (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="p-1 rounded"
                            style={{ backgroundColor: `${account.color}20`, color: account.color }}
                          >
                            <IconComponent className="w-3 h-3" />
                          </div>
                          <span>{account.name}</span>
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {fromAccount && (
              <p className="text-sm text-gray-500">
                Balance disponible: {formatCurrency(fromAccount.balance)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="toAccount">Cuenta destino *</Label>
            <Select value={formData.toAccountId} onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona cuenta destino" />
              </SelectTrigger>
              <SelectContent>
                {accounts
                  .filter(account => account.id !== formData.fromAccountId)
                  .map((account) => {
                    const IconComponent = accountTypeIcons[account.type]
                    return (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="p-1 rounded"
                              style={{ backgroundColor: `${account.color}20`, color: account.color }}
                            >
                              <IconComponent className="w-3 h-3" />
                            </div>
                            <span>{account.name}</span>
                          </div>
                          <span className="text-sm text-gray-500 ml-2">
                            {formatCurrency(account.balance)}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto a transferir *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Motivo de la transferencia"
              rows={3}
            />
          </div>

          {/* Transfer Preview */}
          {fromAccount && toAccount && formData.amount && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-gray-900">Resumen de transferencia</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">De:</span>
                <span className="font-medium">{fromAccount.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">A:</span>
                <span className="font-medium">{toAccount.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Monto:</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(parseFloat(formData.amount) || 0)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Transferir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}