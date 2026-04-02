import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Wallet, TrendingUp, TrendingDown, Layers,
  ArrowDown, ArrowUp, GitMerge, CheckCircle2,
  HelpCircle, Split,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/stores/uiStore'
import { useNavigate } from 'react-router-dom'

// ── Pool data ────────────────────────────────────────────────────────────────
const pools = [
  {
    network: 'ETH', label: 'Ethereum', currency: 'USDC',
    amount: '$250,000', ntd: 'NT$7,962,500',
    pct: 50, bar: 'bg-blue-400',
    netCls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    address: '0x1a2b3c4d…',
  },
  {
    network: 'POL', label: 'Polygon', currency: 'USDC',
    amount: '$100,000', ntd: 'NT$3,185,000',
    pct: 20, bar: 'bg-violet-400',
    netCls: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
    address: '0x5e6f7a8b…',
  },
  {
    network: 'SOL', label: 'Solana', currency: 'USDC',
    amount: '$65,000', ntd: 'NT$2,070,250',
    pct: 13, bar: 'bg-emerald-400',
    netCls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    address: 'So1ana9xQ…',
  },
  {
    network: 'TRX', label: 'Tron', currency: 'USDT',
    amount: '$85,000', ntd: 'NT$2,707,250',
    pct: 17, bar: 'bg-orange-400',
    netCls: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
    address: 'TQfaGh8k…',
  },
]

// ── Transaction rows ─────────────────────────────────────────────────────────
const ALL_TXS = [
  { dir: 'in',  ref: 'INV-20260318-001', company: 'Acme Corp',       amount: 5000,  currency: 'USDC', pool: 'eth', status: 'matched',   date: '2026-03-18', dateLabel: 'Mar 18, 2026' },
  { dir: 'in',  ref: 'INV-20260316-003', company: 'Sunrise Imports', amount: 4900,  currency: 'USDC', pool: 'eth', status: 'partial',   date: '2026-03-16', dateLabel: 'Mar 16, 2026' },
  { dir: 'in',  ref: '—',               company: '—',                amount: 8200,  currency: 'USDC', pool: 'eth', status: 'unmatched', date: '2026-03-20', dateLabel: 'Mar 20, 2026' },
  { dir: 'out', ref: 'PAY-20260314-006', company: 'Office Depot',    amount: 450,   currency: 'USDC', pool: 'eth', status: 'matched',   date: '2026-03-14', dateLabel: 'Mar 14, 2026' },
  { dir: 'out', ref: '—',               company: '—',                amount: 15000, currency: 'USDT', pool: 'trx', status: 'unmatched', date: '2026-03-21', dateLabel: 'Mar 21, 2026' },
]

const POOL_OPTS   = [{ value: '', label: 'All Pools'    }, { value: 'eth', label: 'USDC · ETH' }, { value: 'trx', label: 'USDT · TRX' }]
const STATUS_OPTS = [{ value: '', label: 'All Statuses' }, { value: 'matched', label: 'Matched' }, { value: 'unmatched', label: 'Unmatched' }, { value: 'partial', label: 'Partially Matched' }]
const SORT_OPTS   = [{ value: 'date-desc', label: 'Sort: Date ↓' }, { value: 'date-asc', label: 'Sort: Date ↑' }, { value: 'amount-desc', label: 'Sort: Amount ↓' }]

const txStatusCls: Record<string, string> = {
  matched:   'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  partial:   'bg-amber-50  dark:bg-amber-500/10  text-amber-700  dark:text-amber-400',
  unmatched: 'bg-gray-100  dark:bg-white/[0.07]  text-gray-500   dark:text-gray-400',
}
const txStatusIcon: Record<string, React.ElementType> = {
  matched: CheckCircle2, partial: Split, unmatched: HelpCircle,
}
const txStatusLabel: Record<string, string> = {
  matched: 'Matched', partial: 'Partially Matched', unmatched: 'Unmatched',
}

function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {children}
    </span>
  )
}

export default function Treasury() {
  const { t } = useTranslation()
  const { openModal } = useUiStore()
  const navigate = useNavigate()

  const [statusF, setStatusF] = useState('')
  const [poolF,   setPoolF]   = useState('')
  const [sort,    setSort]    = useState('date-desc')

  const rows = useMemo(() => {
    let data = ALL_TXS.filter((tx) => {
      if (statusF && tx.status !== statusF) return false
      if (poolF   && tx.pool   !== poolF)   return false
      return true
    })
    if (sort === 'date-desc')   data = [...data].sort((a, b) => b.date.localeCompare(a.date))
    if (sort === 'date-asc')    data = [...data].sort((a, b) => a.date.localeCompare(b.date))
    if (sort === 'amount-desc') data = [...data].sort((a, b) => b.amount - a.amount)
    return data
  }, [statusF, poolF, sort])

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">
            {t('page.treasury')}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{t('page.treasurySub')}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => openModal('change-wallet')}>
          <Wallet className="w-3.5 h-3.5" />
          {t('action.changeWallet')}
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total USD Value</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            </div>
          </div>
          <p className="font-grotesk font-semibold text-2xl text-gray-900 dark:text-white">$500,000</p>
          <p className="text-xs text-gray-400 mt-0.5">NT$15,925,000</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Pools</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>
          <p className="font-grotesk font-semibold text-2xl text-gray-900 dark:text-white">4</p>
          <p className="text-xs text-gray-400 mt-0.5">ETH · POL · SOL · TRX</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Low Liquidity</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>
          <p className="font-grotesk font-semibold text-2xl text-gray-900 dark:text-white">0</p>
          <p className="text-xs text-gray-400 mt-0.5">All pools healthy</p>
        </Card>
      </div>

      {/* Portfolio allocation bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Portfolio Allocation</p>
          <p className="text-[10px] text-gray-400">$500,000 total</p>
        </div>
        <div className="flex rounded-full overflow-hidden h-3 gap-px">
          <div className="bg-blue-400"    style={{ width: '50%' }} title="USDC · ETH 50%" />
          <div className="bg-violet-400"  style={{ width: '20%' }} title="USDC · POL 20%" />
          <div className="bg-orange-400"  style={{ width: '17%' }} title="USDT · TRX 17%" />
          <div className="bg-emerald-400" style={{ width: '13%' }} title="USDC · SOL 13%" />
        </div>
        <div className="flex items-center gap-5 mt-2 flex-wrap">
          {pools.map((p) => (
            <span key={p.network} className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
              <span className={`w-2 h-2 rounded-full inline-block ${p.bar}`} />
              {p.network} {p.pct}%
            </span>
          ))}
        </div>
      </Card>

      {/* Pool cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {pools.map((pool) => (
          <Card key={pool.network} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pool.netCls}`}>
                  <span className="text-[10px] font-bold">{pool.network}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{pool.currency}</p>
                  <p className="text-[10px] text-gray-400">{pool.label}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                Healthy
              </span>
            </div>
            <div>
              <p className="font-grotesk text-xl font-semibold text-gray-900 dark:text-white">{pool.amount}</p>
              <p className="text-xs text-gray-400">{pool.ntd}</p>
            </div>
            <div>
              <div className="h-1.5 rounded-full bg-gray-200/50 dark:bg-white/[0.07] overflow-hidden">
                <div className={`h-full rounded-full ${pool.bar}`} style={{ width: `${pool.pct}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{pool.pct}% of total · {pool.address}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Transaction table */}
      <Card className="overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-white/[0.06] flex-wrap">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-1">Transactions</p>
          <select value={statusF} onChange={(e) => setStatusF(e.target.value)} aria-label="Filter by status" className="filter-select">
            {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={poolF} onChange={(e) => setPoolF(e.target.value)} aria-label="Filter by pool" className="filter-select">
            {POOL_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort transactions" className="filter-select">
            {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/[0.06]">
              {['Dir', 'Reference', 'Company', 'Amount', 'Status', 'Date', ''].map((h) => (
                <th key={h} scope="col" className={`px-5 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
            {rows.map((tx, i) => {
              const Icon = txStatusIcon[tx.status] ?? HelpCircle
              return (
                <tr key={i} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors">{/* hover only — no row-level onClick */}
                  <td className="px-5 py-3.5">
                    {tx.dir === 'in'
                      ? <Pill cls="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><ArrowDown className="w-2.5 h-2.5" />IN</Pill>
                      : <Pill cls="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300"><ArrowUp className="w-2.5 h-2.5" />OUT</Pill>
                    }
                  </td>
                  <td className="px-5 py-3.5 font-mono text-gray-600 dark:text-gray-400">{tx.ref}</td>
                  <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300">{tx.company}</td>
                  <td className="px-5 py-3.5 text-right">
                    <p className={`font-semibold ${tx.dir === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      {tx.dir === 'in' ? '+' : '−'}{tx.amount.toLocaleString()}
                    </p>
                    <span className="net-chip cur-usdc">{tx.currency}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Pill cls={txStatusCls[tx.status]}>
                      <Icon className="w-2.5 h-2.5" />
                      {txStatusLabel[tx.status]}
                    </Pill>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">{tx.dateLabel}</td>
                  <td className="px-5 py-3.5 text-right">
                    {tx.status === 'unmatched' && (
                      <button
                        onClick={() => navigate('/reconciliation')}
                        className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 transition-colors ml-auto whitespace-nowrap"
                      >
                        <GitMerge className="w-3 h-3" /> Reconcile
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-xs text-gray-400">No transactions match the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

    </div>
  )
}
