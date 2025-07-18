import React, { useState } from 'react'
import { useFinance } from '../../hooks/useFinance'
import { AccountType } from '../../context/FinanceTypes'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { CreditCard, Wallet, Building2, PiggyBank } from 'lucide-react'

interface AddAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

const accountTypes = [
  { value: 'cash' as AccountType, label: 'Efectivo', icon: Wallet },
  { value: 'bank' as AccountType, label: 'Cuenta Bancaria', icon: Building2 },
  { value: 'credit' as AccountType, label: 'Tarjeta de Crédito', icon: CreditCard },
  { value: 'savings' as AccountType, label: 'Ahorros', icon: PiggyBank },
]

const accountColors = [
  '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
]

export function AddAccountModal({ isOpen, onClose }: AddAccountModalProps) {
  const { addAccount } = useFinance()
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as AccountType,
    balance: '',
    color: '#2563EB',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('El nombre de la cuenta es obligatorio')
      return
    }

    addAccount({
      name: formData.name.trim(),
      type: formData.type,
      balance: parseFloat(formData.balance) || 0,
      color: formData.color,
      description: formData.description.trim()
    })

    // Reset form
    setFormData({
      name: '',
      type: 'bank',
      balance: '',
      color: '#2563EB',
      description: ''
    })
    
    onClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'bank',
      balance: '',
      color: '#2563EB',
      description: ''
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Cuenta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la cuenta *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Cuenta Corriente BBVA"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de cuenta</Label>
            <Select value={formData.type} onValueChange={(value: AccountType) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => {
                  const IconComponent = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Balance inicial</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {accountColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción adicional de la cuenta"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Cuenta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}