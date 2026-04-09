import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  GitCompareArrows, Wallet, Landmark, GitMerge, ArrowRight, Clock, AlertTriangle,
  ArrowDown, ArrowUp, X,
} from 'lucide-react'
import { PaymentDrawer } from '@/components/payments/PaymentDrawer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { PAYMENTS, getDashboardPendingItems } from '@/data/payments'
import type { Payment, PayStatus } from '@/data/payments'

// ── Treasury pool breakdown ──────────────────────────────────────────────────
const pools = [
  { dot: 'bg-blue-400',    label: 'USDC · ETH', amount: '250,000', ticker: 'USDC' },
  { dot: 'bg-violet-400',  label: 'USDC · POL', amount: '100,000', ticker: 'USDC' },
  { dot: 'bg-emerald-400', label: 'USDC · SOL', amount: '65,000',  ticker: 'USDC' },
  { dot: 'bg-amber-400',   label: 'USDT · TRX', amount: '85,000',  ticker: 'USDT' },
]

// ── Reconciliation items ─────────────────────────────────────────────────────
const reconItems = [
  { hash: '0x7f3a…c91e', desc: '+4,900 USDC · Expected 5,000', badge: 'Discrepancy', badgeCls: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' },
  { hash: '0xb2d1…44fa', desc: '+8,200 USDC',                  badge: 'No Match',    badgeCls: 'bg-gray-200/50 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400' },
  { hash: 'TQsun…rise9', desc: '+15,000 USDT',                 badge: 'No Match',    badgeCls: 'bg-gray-200/50 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400' },
]

// ── Cash flow chart data ─────────────────────────────────────────────────────
const chartMonths = [
  { label: 'Oct', inPct: 43,  outPct: 0,    inLabel: '+5.2k',  outLabel: null },
  { label: 'Nov', inPct: 80,  outPct: 0,    inLabel: '+9.8k',  outLabel: null },
  { label: 'Dec', inPct: 50,  outPct: 0,    inLabel: '+6.1k',  outLabel: null },
  { label: 'Jan', inPct: 70,  outPct: 0,    inLabel: '+8.5k',  outLabel: null },
  { label: 'Feb', inPct: 100, outPct: 0,    inLabel: '+12.2k', outLabel: null },
  { label: 'Mar', inPct: 0,   outPct: 100,  inLabel: null,     outLabel: '−2.1k' },
]

// ── Recent Transactions ───────────────────────────────────────────────────────
const recentTxRows = [
  { hash: '0x5e6f…1e2f', party: 'Acme Corp',        amount: '+5,000',  currency: 'USDC', date: 'Mar 18', status: 'matched',   dir: 'in'  },
  { hash: '0xe4f7…a901', party: 'Global Trade Ltd', amount: '+12,000', currency: 'USDC', date: 'Mar 17', status: 'matched',   dir: 'in'  },
  { hash: '0x9a8b…3a2b', party: 'Sunrise Imports',  amount: '+4,900',  currency: 'USDC', date: 'Mar 16', status: 'partial',   dir: 'in'  },
  { hash: '0xb2d1…44fa', party: '—',                 amount: '+8,200',  currency: 'USDC', date: 'Mar 20', status: 'unmatched', dir: 'in'  },
  { hash: '0xa1b2…a7b8', party: 'AWS Services',     amount: '−2,200',  currency: 'USDC', date: 'Mar 10', status: 'matched',   dir: 'out' },
]

const txStatusStyle: Record<string, string> = {
  matched:   'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  partial:   'bg-amber-50  dark:bg-amber-500/10  text-amber-700  dark:text-amber-400',
  unmatched: 'bg-gray-100  dark:bg-white/[0.07]  text-gray-500   dark:text-gray-400',
}

const txStatusLabel: Record<string, string> = {
  matched: 'Matched', partial: 'Partial', unmatched: 'Unmatched',
}

// ── Recon item type ───────────────────────────────────────────────────────────
type ReconItem = { hash: string; desc: string; badge: string; badgeCls: string }

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_BADGE: Record<PayStatus, { label: string; cls: string }> = {
  'pending-manager': { label: 'Pending',       cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  'awaiting-sig':    { label: 'Awaiting Sig.', cls: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400' },
  'rejected':        { label: 'Rejected',      cls: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' },
  'paid':            { label: 'Paid',          cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
}

// For Manager/CFO: items in their "Awaiting Sig" tab show as "Sign" label
function getItemBadge(status: PayStatus, isAwaitingMyTurn: boolean) {
  if (isAwaitingMyTurn) return { label: 'Sign Required', cls: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400' }
  return STATUS_BADGE[status]
}

export default function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { openModal } = useUiStore()
  const { profile } = useUserStore()
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [selectedRecon,   setSelectedRecon]   = useState<ReconItem | null>(null)

  // Role-aware pending items: awaiting-sig (my turn) first, then pending
  const pendingItems = getDashboardPendingItems(profile.roleKey)

  // Determine which items are "my turn" (awaiting-sig tab items)
  const awaitingMyTurnIds = new Set(
    PAYMENTS.filter((p) => {
      const awaitingRole = p.chain.find((s) => s.status === 'awaiting')?.role ?? ''
      if (profile.roleKey === 'manager') return p.status === 'pending-manager' && awaitingRole === 'Manager'
      if (profile.roleKey === 'cfo')     return p.status === 'pending-manager' && awaitingRole === 'CFO'
      return false
    }).map((p) => p.id)
  )

  function handleItemClick(ref: string) {
    const p = PAYMENTS.find((x) => x.ref === ref)
    if (p) setSelectedPayment(p)
  }

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">
            {t('page.overview')}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{t('page.snapshot')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => openModal('change-wallet')}>
            <Wallet className="w-3.5 h-3.5" />
            {t('action.changeWallet')}
          </Button>
          <Button size="sm" onClick={() => navigate('/reconciliation')}>
            <GitCompareArrows className="w-3.5 h-3.5" />
            {t('action.reconcile')}
          </Button>
        </div>
      </div>

      {/* ── Three equal-width cards: Treasury · Approvals · Reconciliation ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Treasury Total */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Treasury Total</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
              <Landmark className="w-3.5 h-3.5 text-orange-500" />
            </div>
          </div>
          <div className="mt-2">
            <p className="font-grotesk font-semibold text-2xl text-gray-900 dark:text-white">$500,000</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">NT$15,925,000</p>
          </div>
          <div className="space-y-1 pt-2 mt-2 border-t border-gray-50 dark:border-white/5">
            {pools.map((p) => (
              <div key={p.label} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${p.dot}`} />
                  {p.label}
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {p.amount} <span className="text-gray-400 font-normal">{p.ticker}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pending Approvals</span>
              {pendingItems.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                  {pendingItems.length}
                </span>
              )}
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>

          <div className="mt-2 flex-1 divide-y divide-gray-100/60 dark:divide-white/[0.04]">
            {pendingItems.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">No pending items</p>
            ) : (
              pendingItems.slice(0, 3).map((item) => {
                const isMyTurn = awaitingMyTurnIds.has(item.id)
                const badge = getItemBadge(item.status, isMyTurn)
                return (
                  <button
                    key={item.ref}
                    onClick={() => handleItemClick(item.ref)}
                    className="w-full flex items-center justify-between px-0 py-1.5 hover:bg-gray-100/40 dark:hover:bg-white/[0.05] rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-mono text-gray-400 truncate">{item.ref}</p>
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{item.payee}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {item.amount.toLocaleString()} <span className="text-gray-400 font-normal text-[10px]">{item.currency}</span>
                      </span>
                      {item.deadlineExpired && (
                        <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                      )}
                      <Badge className={`shrink-0 ${badge.cls}`}>{badge.label}</Badge>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <div className="pt-2 mt-1 border-t border-gray-50 dark:border-white/5">
            <button
              onClick={() => navigate('/approvals')}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 transition-colors"
            >
              View Approvals <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </Card>

        {/* Reconciliation */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Reconciliation</span>
              <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">3</span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <GitMerge className="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>
          <div className="mt-2 flex-1 divide-y divide-gray-100/60 dark:divide-white/[0.04]">
            {reconItems.map((item) => (
              <button
                key={item.hash}
                onClick={() => setSelectedRecon(item)}
                className="w-full flex items-center justify-between px-0 py-1.5 hover:bg-gray-100/40 dark:hover:bg-white/[0.05] rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-gray-400 truncate">{item.hash}</p>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{item.desc}</p>
                </div>
                <Badge className={`shrink-0 ml-2 ${item.badgeCls}`}>{item.badge}</Badge>
              </button>
            ))}
          </div>
          <div className="pt-2 mt-1 border-t border-gray-50 dark:border-white/5">
            <button
              onClick={() => navigate('/reconciliation')}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 transition-colors"
            >
              {t('action.reconcile')} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </Card>
      </div>

      {/* ── In & Out Chart ─────────────────────────────────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-grotesk font-semibold text-sm text-gray-900 dark:text-white">In &amp; Out</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Monthly cash flow · USD</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />In
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-gray-300 dark:bg-white/20 inline-block" />Out
            </span>
          </div>
        </div>

        {/* Value labels */}
        <div className="flex gap-2 px-1 mb-1">
          {chartMonths.map((m) => (
            <div key={m.label} className="flex-1 text-center text-[9px] font-semibold text-gray-500 dark:text-gray-400">
              {m.inLabel || m.outLabel}
            </div>
          ))}
        </div>

        {/* Positive bars */}
        <div className="flex items-end gap-2 px-1" style={{ height: 72 }}>
          {chartMonths.map((m) => (
            <div key={m.label} className="flex-1 flex items-end" style={{ height: 72 }}>
              {m.inPct > 0 && (
                <div
                  className="pl-bar-pos w-full"
                  style={{ height: Math.round((m.inPct / 100) * 72), borderRadius: '4px 4px 0 0' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Zero baseline */}
        <div className="mx-1 border-t border-dashed border-gray-200 dark:border-white/10" />

        {/* Negative bars */}
        <div className="flex items-start gap-2 px-1" style={{ height: 18 }}>
          {chartMonths.map((m) => (
            <div key={m.label} className="flex-1" style={{ height: 18 }}>
              {m.outPct > 0 && (
                <div
                  className="pl-bar-neg w-full"
                  style={{ height: Math.round((m.outPct / 100) * 18), borderRadius: '0 0 4px 4px' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Month labels */}
        <div className="flex gap-2 px-1 mt-1">
          {chartMonths.map((m) => (
            <div key={m.label} className="flex-1 text-center text-[9px] text-gray-400">{m.label}</div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 dark:border-white/5">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>YTD 2026</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">+$18,600</span>
          </div>
          <div className="text-xs text-gray-400">
            Best month: <span className="font-medium text-gray-700 dark:text-gray-300">Feb · +$12,200</span>
          </div>
        </div>
      </Card>

      {/* ── Recent Transactions ────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50 dark:border-white/5">
          <div>
            <h3 className="font-grotesk font-semibold text-sm text-gray-900 dark:text-white">Recent Transactions</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">On-chain activity · last 30 days</p>
          </div>
          <button
            onClick={() => navigate('/reconciliation')}
            className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/[0.06]">
              {['Dir', 'TX Hash', 'Counterparty', 'Amount', 'Date', 'Status'].map((h) => (
                <th key={h} className={`px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
            {recentTxRows.map((tx) => (
              <tr
                key={tx.hash}
                onClick={() => navigate('/reconciliation')}
                className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  {tx.dir === 'in'
                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><ArrowDown className="w-2.5 h-2.5" />IN</span>
                    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300"><ArrowUp className="w-2.5 h-2.5" />OUT</span>
                  }
                </td>
                <td className="px-4 py-3 font-mono text-gray-400 dark:text-gray-500 whitespace-nowrap">{tx.hash}</td>
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{tx.party}</td>
                <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${tx.amount.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  {tx.amount} <span className="text-gray-400 font-normal">{tx.currency}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{tx.date}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${txStatusStyle[tx.status] ?? txStatusStyle.unmatched}`}>
                    {txStatusLabel[tx.status] ?? tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ── Payment Detail Drawer ──────────────────────────────────────────── */}
      <PaymentDrawer
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        roleKey={profile.roleKey}
      />

      {/* ── Reconciliation Detail Modal ────────────────────────────────────── */}
      {selectedRecon && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 px-4" onClick={() => setSelectedRecon(null)}>
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
              <div>
                <p className="text-[10px] font-mono text-gray-400">{selectedRecon.hash}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${selectedRecon.badgeCls}`}>{selectedRecon.badge}</span>
                </div>
              </div>
              <button onClick={() => setSelectedRecon(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ml-3 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Transaction</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRecon.desc}</p>
              <p className="text-xs text-gray-400 mt-2">This transaction needs to be matched to a bill or invoice in the reconciliation module.</p>
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-white/[0.06] flex justify-between items-center">
              <button onClick={() => setSelectedRecon(null)} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Close</button>
              <button
                onClick={() => { setSelectedRecon(null); navigate('/reconciliation') }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
              >
                Match in Reconciliation <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
