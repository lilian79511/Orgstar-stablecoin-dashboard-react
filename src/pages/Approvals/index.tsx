import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, AlertCircle, ArrowUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/stores/uiStore'

// ── Types ────────────────────────────────────────────────────────────────────
type ApprovalStatus = 'pending' | 'approved' | 'rejected'

interface Approval {
  id: string
  ref: string
  vendor: string
  category: string
  amount: string
  currency: string
  network: string
  requestedBy: string
  requestedAt: string
  status: ApprovalStatus
  note: string | null
}

// ── Data ─────────────────────────────────────────────────────────────────────
const INITIAL: Approval[] = [
  { id: 'a1', ref: 'PAY-20260401-008', vendor: 'AWS Services',     category: 'Cloud Infrastructure',  amount: '3,200', currency: 'USDC', network: 'ETH', requestedBy: 'Lillian Chen',  requestedAt: 'Apr 1, 2026',  status: 'pending',  note: null },
  { id: 'a2', ref: 'PAY-20260330-009', vendor: 'Vendor Inc',       category: 'SaaS Subscription',     amount: '8,750', currency: 'USDT', network: 'TRX', requestedBy: 'Kevin Wu',     requestedAt: 'Mar 30, 2026', status: 'pending',  note: null },
  { id: 'a3', ref: 'PAY-20260328-010', vendor: 'Office Depot',     category: 'Office Supplies',       amount: '450',   currency: 'USDC', network: 'ETH', requestedBy: 'Lillian Chen',  requestedAt: 'Mar 28, 2026', status: 'rejected', note: 'Exceeds monthly office budget. Please resubmit next quarter.' },
  { id: 'a4', ref: 'PAY-20260320-005', vendor: 'Delta Components', category: 'Hardware Parts',        amount: '22,500',currency: 'USDC', network: 'ETH', requestedBy: 'Sam Huang',    requestedAt: 'Mar 20, 2026', status: 'approved', note: null },
  { id: 'a5', ref: 'PAY-20260315-004', vendor: 'Tech Supplies Co', category: 'IT Equipment',          amount: '5,800', currency: 'USDC', network: 'ETH', requestedBy: 'Kevin Wu',     requestedAt: 'Mar 15, 2026', status: 'approved', note: null },
  { id: 'a6', ref: 'PAY-20260310-007', vendor: 'AWS Services',     category: 'Cloud Infrastructure',  amount: '2,200', currency: 'USDC', network: 'ETH', requestedBy: 'Lillian Chen',  requestedAt: 'Mar 10, 2026', status: 'approved', note: null },
]

const netCls: Record<string, string> = {
  ETH: 'net-eth', TRX: 'net-trx', POL: 'net-pol', SOL: 'net-sol',
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const map = {
    pending:  { cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400', label: 'Pending',  Icon: Clock },
    approved: { cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', label: 'Approved', Icon: CheckCircle2 },
    rejected: { cls: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400', label: 'Rejected', Icon: XCircle },
  }
  const { cls, label, Icon } = map[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      <Icon className="w-2.5 h-2.5" />{label}
    </span>
  )
}

export default function Approvals() {
  const [items, setItems] = useState<Approval[]>(INITIAL)
  const [filter, setFilter] = useState<'all' | ApprovalStatus>('all')
  const { showToast } = useUiStore()

  function approve(id: string) {
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, status: 'approved', note: null } : a))
    showToast('Payment approved', 'success')
  }

  function reject(id: string) {
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, status: 'rejected', note: 'Rejected by CFO review.' } : a))
    showToast('Payment rejected', 'error')
  }

  const visible = filter === 'all' ? items : items.filter((a) => a.status === filter)
  const pendingCount  = items.filter((a) => a.status === 'pending').length
  const approvedCount = items.filter((a) => a.status === 'approved').length
  const rejectedCount = items.filter((a) => a.status === 'rejected').length

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">
            Payment Approvals
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Review and approve outgoing payments before execution</p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-3 h-3" />
            {pendingCount} awaiting review
          </span>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',  count: pendingCount,  cls: 'text-amber-600 dark:text-amber-400',   border: 'border-l-4 border-amber-400', status: 'pending'  as const },
          { label: 'Approved', count: approvedCount, cls: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-4 border-emerald-400', status: 'approved' as const },
          { label: 'Rejected', count: rejectedCount, cls: 'text-red-500 dark:text-red-400',        border: 'border-l-4 border-red-400',   status: 'rejected' as const },
        ].map((s) => (
          <Card
            key={s.label}
            onClick={() => setFilter((f) => f === s.status ? 'all' : s.status)}
            className={`p-4 cursor-pointer hover:shadow-sm transition-shadow ${s.border} ${filter === s.status ? 'ring-2 ring-orange-400/30' : ''}`}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
            <p className={`font-grotesk font-semibold text-2xl mt-1 ${s.cls}`}>{s.count}</p>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0 border-b border-gray-100 dark:border-white/[0.08]">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap -mb-px
              ${filter === f
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Approval cards */}
      <div className="space-y-3">
        {visible.map((item) => (
          <Card key={item.id} className={`overflow-hidden ${
            item.status === 'pending'  ? 'border border-amber-100 dark:border-amber-500/15' :
            item.status === 'rejected' ? 'border border-red-100 dark:border-red-500/15 opacity-75' : ''
          }`}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                {/* Left: details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[10px] font-mono text-gray-400">{item.ref}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.vendor}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span>Requested by <span className="text-gray-600 dark:text-gray-300 font-medium">{item.requestedBy}</span></span>
                    <span>·</span>
                    <span>{item.requestedAt}</span>
                  </div>
                </div>

                {/* Right: amount + actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-base font-semibold text-red-500 dark:text-red-400">
                      <ArrowUp className="w-3 h-3 inline mr-0.5" />
                      {item.amount}
                      <span className="text-xs font-normal text-gray-400 ml-1">{item.currency}</span>
                    </p>
                    <span className={`net-chip ${netCls[item.network] ?? ''} mt-0.5`}>{item.network}</span>
                  </div>
                  {item.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => reject(item.id)}>
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                      <Button size="sm" onClick={() => approve(item.id)}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection note */}
              {item.status === 'rejected' && item.note && (
                <div className="mt-3 pt-3 border-t border-gray-50 dark:border-white/[0.04]">
                  <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3 shrink-0" /> {item.note}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}

        {visible.length === 0 && (
          <Card className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No items in this category</p>
          </Card>
        )}
      </div>
    </div>
  )
}
