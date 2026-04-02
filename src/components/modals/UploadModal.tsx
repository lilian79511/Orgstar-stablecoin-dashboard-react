import { useState } from 'react'
import { X, Upload, FileText } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/stores/uiStore'

interface Props {
  type: 'invoice' | 'bill'
}

const CURRENCIES = ['USDC', 'USDT', 'DAI']
const NETWORKS   = ['ETH', 'POL', 'SOL', 'TRX']

export function UploadModal({ type }: Props) {
  const { activeModal, closeModal, showToast } = useUiStore()
  const isOpen = activeModal === (type === 'invoice' ? 'upload-invoice' : 'upload-bill')

  const isInvoice = type === 'invoice'
  const accent = isInvoice ? 'orange' : 'violet'

  // Form state
  const [form, setForm] = useState({
    counterparty: '',
    ref:          '',
    amount:       '',
    currency:     'USDC',
    network:      'ETH',
    date:         '',
    dueDate:      '',
    category:     '',
    notes:        '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function onClose() {
    closeModal()
    setForm({ counterparty: '', ref: '', amount: '', currency: 'USDC', network: 'ETH', date: '', dueDate: '', category: '', notes: '' })
  }

  function handleSubmit() {
    if (!form.counterparty || !form.amount) return
    showToast(
      `${isInvoice ? 'Invoice' : 'Bill'} ${form.ref || 'created'} for ${form.counterparty}`,
      'success'
    )
    onClose()
  }

  const isValid = form.counterparty.trim() && form.amount.trim()

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500/60 transition-colors'
  const labelCls = 'block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1'

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent === 'orange' ? 'bg-orange-50 dark:bg-orange-500/10' : 'bg-violet-50 dark:bg-violet-500/10'}`}>
            {isInvoice ? <FileText className={`w-3.5 h-3.5 text-orange-500`} /> : <Upload className="w-3.5 h-3.5 text-violet-500" />}
          </div>
          <h3 className="font-grotesk font-semibold text-sm text-gray-900 dark:text-white">
            {isInvoice ? 'New Invoice' : 'New Bill'}
          </h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form */}
      <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{isInvoice ? 'Customer *' : 'Vendor *'}</label>
            <input value={form.counterparty} onChange={(e) => set('counterparty', e.target.value)}
              placeholder={isInvoice ? 'e.g. Acme Corp' : 'e.g. AWS Services'}
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Reference No.</label>
            <input value={form.ref} onChange={(e) => set('ref', e.target.value)}
              placeholder={isInvoice ? 'INV-2026…' : 'PAY-2026…'}
              className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className={labelCls}>Amount *</label>
            <input value={form.amount} onChange={(e) => set('amount', e.target.value)}
              placeholder="0.00" type="number" min="0"
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={inputCls}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Network</label>
            <select value={form.network} onChange={(e) => set('network', e.target.value)} className={inputCls}>
              {NETWORKS.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{isInvoice ? 'Invoice Date' : 'Bill Date'}</label>
            <input value={form.date} onChange={(e) => set('date', e.target.value)}
              type="date" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{isInvoice ? 'Due Date' : 'Payment Due'}</label>
            <input value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)}
              type="date" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>{isInvoice ? 'Description / Services' : 'Category'}</label>
          <input value={form.category} onChange={(e) => set('category', e.target.value)}
            placeholder={isInvoice ? 'e.g. Consulting services for Q1 2026' : 'e.g. Cloud Infrastructure'}
            className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Notes (optional)</label>
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
            rows={2} placeholder="Any additional notes…"
            className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-white/[0.06]">
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={!isValid} onClick={handleSubmit}>
          {isInvoice ? <FileText className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
          {isInvoice ? 'Create Invoice' : 'Create Bill'}
        </Button>
      </div>
    </Modal>
  )
}
