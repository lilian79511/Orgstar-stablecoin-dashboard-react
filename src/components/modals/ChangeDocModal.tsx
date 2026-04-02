import { useState } from 'react'
import { X, Search, Repeat2, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

// Available invoices / bills to pick from
const AVAILABLE_INVOICES = [
  { ref: 'INV-20260318-001', party: 'Acme Corp',        sub: 'Due Apr 1, 2026',  amount: '5,000',  currency: 'USDC' },
  { ref: 'INV-20260317-002', party: 'Global Trade Ltd', sub: 'Due Mar 30, 2026', amount: '12,000', currency: 'USDC' },
  { ref: 'INV-20260316-003', party: 'Sunrise Imports',  sub: 'Due Mar 28, 2026', amount: '5,000',  currency: 'USDC' },
  { ref: 'INV-20260322-004', party: 'Delta Components', sub: 'Due Apr 5, 2026',  amount: '3,500',  currency: 'USDT' },
]

const AVAILABLE_BILLS = [
  { ref: 'PAY-20260310-007', party: 'AWS Services', sub: 'Cloud Infrastructure', amount: '2,200', currency: 'USDC' },
  { ref: 'PAY-20260314-006', party: 'Office Depot',  sub: 'Office Supplies',     amount: '450',   currency: 'USDC' },
  { ref: 'PAY-20260301-003', party: 'Vendor Inc',    sub: 'SaaS Subscription',   amount: '8,750', currency: 'USDT' },
]

const AVAILABLE_TXS = [
  { ref: '0x5e6f7a8b9c0d1e2f…', time: 'Mar 18 · 14:20 UTC', amount: '+5,000',  currency: 'USDC', dir: 'in' },
  { ref: '0x9a8b7c6d5e4f3a2b…', time: 'Mar 16 · 11:02 UTC', amount: '+4,900',  currency: 'USDC', dir: 'in' },
  { ref: '0xb2d144fa…',         time: 'Mar 20 · 09:15 UTC', amount: '+8,200',  currency: 'USDC', dir: 'in' },
  { ref: '0xa1b2c3d4e5f6a7b8…', time: 'Mar 10 · 16:06 UTC', amount: '−2,200',  currency: 'USDC', dir: 'out' },
  { ref: '0xe4f7a901…',         time: 'Mar 17 · 10:05 UTC', amount: '+12,000', currency: 'USDC', dir: 'in' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: 'invoice' | 'bill' | 'tx'
  currentRef: string
  onSelect: (ref: string) => void
}

export function ChangeDocModal({ isOpen, onClose, mode, currentRef, onSelect }: Props) {
  const [query, setQuery] = useState('')

  const items = mode === 'invoice' ? AVAILABLE_INVOICES
    : mode === 'bill' ? AVAILABLE_BILLS
    : AVAILABLE_TXS

  const filtered = items.filter((item) => {
    const q = query.toLowerCase()
    if (!q) return true
    return item.ref.toLowerCase().includes(q) || item.party?.toLowerCase().includes(q)
  })

  const title = mode === 'invoice' ? 'Change Invoice'
    : mode === 'bill' ? 'Change Bill'
    : 'Change Transaction'

  function handleSelect(ref: string) {
    onSelect(ref)
    setQuery('')
    onClose()
  }

  function handleClose() {
    setQuery('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
            <Repeat2 className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <h3 className="font-grotesk font-semibold text-sm text-gray-900 dark:text-white">{title}</h3>
        </div>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'tx' ? 'Search by hash…' : 'Search by ref or name…'}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500/60 transition-colors"
            autoFocus
          />
        </div>
      </div>

      {/* List */}
      <div className="px-5 pb-5 space-y-1.5 max-h-72 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">No results found.</p>
        )}
        {filtered.map((item) => {
          const isCurrent = item.ref === currentRef
          return (
            <button
              key={item.ref}
              onClick={() => handleSelect(item.ref)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors
                ${isCurrent
                  ? 'border-orange-300 dark:border-orange-500/40 bg-orange-50/40 dark:bg-orange-500/5'
                  : 'border-gray-100 dark:border-white/[0.06] hover:border-orange-200 dark:hover:border-orange-500/30 hover:bg-gray-50/60 dark:hover:bg-white/[0.03]'
                }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-gray-400 truncate">{item.ref}</p>
                {'party' in item && <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{item.party}</p>}
                {'time' in item && <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5">{item.time}</p>}
                {'sub' in item && <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-semibold ${
                  'dir' in item
                    ? item.dir === 'out' ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {item.amount}
                </p>
                <p className="text-[10px] text-gray-400">{item.currency}</p>
              </div>
              {isCurrent && <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-end px-5 pb-4 border-t border-gray-100 dark:border-white/[0.06] pt-3">
        <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
      </div>
    </Modal>
  )
}
