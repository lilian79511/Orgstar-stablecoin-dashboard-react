import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Upload, RefreshCw, Download, AlertCircle,
  CheckCircle2, XCircle, Clock, ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

// ── Types ────────────────────────────────────────────────────────────────────
type Tab = 'reconcile' | 'matched' | 'invoice' | 'bills' | 'transactions'

const tabs: { key: Tab; i18n: string }[] = [
  { key: 'reconcile',    i18n: 'tab.reconcile' },
  { key: 'matched',      i18n: 'tab.matched' },
  { key: 'invoice',      i18n: 'tab.invoice' },
  { key: 'bills',        i18n: 'tab.bills' },
  { key: 'transactions', i18n: 'tab.transactions' },
]

// ── Helper components ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    matched:     'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    unmatched:   'bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400',
    discrepancy: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',
    partial:     'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
    pending:     'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
    awaiting:    'bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400',
  }
  const labels: Record<string, string> = {
    matched:     'Matched',
    unmatched:   'Unmatched',
    discrepancy: 'Discrepancy',
    partial:     'Partial',
    pending:     'Pending',
    awaiting:    'Awaiting',
  }
  return (
    <Badge className={`shrink-0 ${map[status] ?? map.unmatched}`}>
      {labels[status] ?? status}
    </Badge>
  )
}

function PoolTag({ network }: { network: string }) {
  const map: Record<string, string> = {
    ETH:  'net-eth',
    POL:  'net-pol',
    SOL:  'net-sol',
    TRX:  'net-trx',
    USDC: 'cur-usdc',
    USDT: 'cur-usdt',
  }
  return (
    <span className={`net-chip ${map[network] ?? ''}`}>{network}</span>
  )
}

// ── Reconcile tab data ───────────────────────────────────────────────────────
const reconPairs = [
  {
    id: 'r1',
    invoice: { ref: 'INV-20260320-001', from: 'Acme Corp', amount: '5,000', currency: 'USDC', date: 'Mar 20, 2026' },
    tx: { hash: '0x7f3a…c91e', amount: '5,000', currency: 'USDC', date: 'Mar 20, 2026', network: 'ETH' },
    status: 'matched',
    note: null,
  },
  {
    id: 'r2',
    invoice: { ref: 'INV-20260318-003', from: 'Sunrise Imports', amount: '15,000', currency: 'USDT', date: 'Mar 18, 2026' },
    tx: { hash: 'TQsun…rise9', amount: '14,850', currency: 'USDT', date: 'Mar 19, 2026', network: 'TRX' },
    status: 'discrepancy',
    note: '−150 USDT discrepancy',
  },
  {
    id: 'r3',
    invoice: { ref: null, from: null, amount: null, currency: null, date: null },
    tx: { hash: '0xb2d1…44fa', amount: '8,200', currency: 'USDC', date: 'Mar 22, 2026', network: 'ETH' },
    status: 'unmatched',
    note: 'No matching invoice found',
  },
  {
    id: 'r4',
    invoice: { ref: 'INV-20260315-007', from: 'Delta Components', amount: '22,500', currency: 'USDC', date: 'Mar 15, 2026' },
    tx: { hash: null, amount: null, currency: null, date: null, network: null },
    status: 'awaiting',
    note: 'Awaiting on-chain payment',
  },
  {
    id: 'r5',
    invoice: { ref: null, from: 'AWS Services', amount: null, currency: null, date: null },
    tx: { hash: '0xabc1…f2d3', amount: '3,200', currency: 'USDC', date: 'Mar 28, 2026', network: 'ETH' },
    status: 'matched',
    note: 'Bill payment matched',
  },
  {
    id: 'r6',
    invoice: { ref: null, from: 'Office Depot', amount: '450', currency: 'USDC', date: 'Mar 10, 2026' },
    tx: { hash: null, amount: null, currency: null, date: null, network: null },
    status: 'awaiting',
    note: 'Awaiting on-chain payment',
  },
]

// ── Invoice tab data ─────────────────────────────────────────────────────────
const invoices = [
  { ref: 'INV-20260320-001', from: 'Acme Corp',        amount: '5,000',  currency: 'USDC', date: 'Mar 20, 2026', status: 'awaiting',  network: 'ETH' },
  { ref: 'INV-20260317-002', from: 'Global Trade Ltd', amount: '12,000', currency: 'USDC', date: 'Mar 17, 2026', status: 'matched',   network: 'ETH' },
  { ref: 'INV-20260318-003', from: 'Sunrise Imports',  amount: '15,000', currency: 'USDT', date: 'Mar 18, 2026', status: 'partial',   network: 'TRX' },
  { ref: 'INV-20260315-007', from: 'Delta Components', amount: '22,500', currency: 'USDC', date: 'Mar 15, 2026', status: 'pending',   network: 'ETH' },
]

// ── Bills tab data ───────────────────────────────────────────────────────────
const bills = [
  { ref: 'BILL-20260328-001', vendor: 'AWS Services', amount: '3,200',   currency: 'USDC', date: 'Mar 28, 2026', status: 'matched',  network: 'ETH' },
  { ref: 'BILL-20260310-002', vendor: 'Office Depot',  amount: '450',    currency: 'USDC', date: 'Mar 10, 2026', status: 'awaiting', network: 'ETH' },
  { ref: 'BILL-20260301-003', vendor: 'Vendor Inc',    amount: '8,750',  currency: 'USDT', date: 'Mar 01, 2026', status: 'pending',  network: 'TRX' },
]

// ── Matched tab data ─────────────────────────────────────────────────────────
const matchedItems = [
  { ref: 'INV-20260317-002', from: 'Global Trade Ltd', amount: '12,000', currency: 'USDC', hash: '0xe4f7…a901', date: 'Mar 17, 2026', network: 'ETH' },
  { ref: 'BILL-20260328-001', from: 'AWS Services',    amount: '3,200',  currency: 'USDC', hash: '0xabc1…f2d3', date: 'Mar 28, 2026', network: 'ETH' },
]

// ── Transactions tab data ────────────────────────────────────────────────────
const transactions = [
  { hash: '0x7f3a…c91e', amount: '+5,000',  currency: 'USDC', date: 'Mar 20, 2026', status: 'matched',   network: 'ETH', label: 'Acme Corp · INV-20260320-001' },
  { hash: '0xb2d1…44fa', amount: '+8,200',  currency: 'USDC', date: 'Mar 22, 2026', status: 'unmatched', network: 'ETH', label: null },
  { hash: 'TQsun…rise9', amount: '+14,850', currency: 'USDT', date: 'Mar 19, 2026', status: 'partial',   network: 'TRX', label: 'Sunrise Imports · partial' },
  { hash: '0xe4f7…a901', amount: '+12,000', currency: 'USDC', date: 'Mar 17, 2026', status: 'matched',   network: 'ETH', label: 'Global Trade Ltd · INV-20260317-002' },
  { hash: '0xabc1…f2d3', amount: '−3,200',  currency: 'USDC', date: 'Mar 28, 2026', status: 'matched',   network: 'ETH', label: 'AWS Services · BILL-20260328-001' },
]

// ── Sub-tabs ─────────────────────────────────────────────────────────────────
function ReconcileTab() {
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set())

  function confirm(id: string) {
    setConfirmed((prev) => new Set([...prev, id]))
  }

  return (
    <div className="space-y-3">
      {reconPairs.map((pair) => {
        const isConfirmed = confirmed.has(pair.id)
        return (
          <Card
            key={pair.id}
            className={`p-4 ${pair.status === 'discrepancy' ? 'border-red-200 dark:border-red-500/20' : ''} ${pair.status === 'awaiting' ? 'opacity-70' : ''}`}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              {/* Invoice side */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">Invoice</p>
                {pair.invoice.ref ? (
                  <>
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{pair.invoice.ref}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{pair.invoice.from}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {pair.invoice.amount} <span className="text-xs font-normal text-gray-400">{pair.invoice.currency}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{pair.invoice.date}</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 italic">No invoice</p>
                )}
              </div>

              {/* Status indicator */}
              <div className="flex flex-col items-center gap-1 pt-3">
                {pair.status === 'matched' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {pair.status === 'discrepancy' && <XCircle className="w-5 h-5 text-red-500" />}
                {pair.status === 'unmatched' && <XCircle className="w-5 h-5 text-gray-400" />}
                {pair.status === 'awaiting' && <Clock className="w-5 h-5 text-gray-400" />}
                <StatusBadge status={pair.status} />
              </div>

              {/* TX side */}
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">On-chain TX</p>
                {pair.tx.hash ? (
                  <>
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{pair.tx.hash}</p>
                    {pair.tx.network && <div className="flex justify-end mt-0.5"><PoolTag network={pair.tx.network} /></div>}
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {pair.tx.amount} <span className="text-xs font-normal text-gray-400">{pair.tx.currency}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{pair.tx.date}</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 italic">No transaction</p>
                )}
              </div>
            </div>

            {/* Note + action */}
            {(pair.note || pair.status === 'matched' || pair.status === 'discrepancy') && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100/60 dark:border-white/[0.04]">
                <p className={`text-[11px] ${pair.status === 'discrepancy' ? 'text-red-500' : 'text-gray-400'}`}>
                  {pair.note}
                </p>
                {(pair.status === 'matched' || pair.status === 'discrepancy') && !isConfirmed && (
                  <Button size="sm" variant={pair.status === 'discrepancy' ? 'secondary' : 'primary'} onClick={() => confirm(pair.id)}>
                    {pair.status === 'discrepancy' ? 'Confirm Partial' : 'Confirm Match'}
                  </Button>
                )}
                {(pair.status === 'matched' || pair.status === 'discrepancy') && isConfirmed && (
                  <span className="text-[11px] font-medium text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                  </span>
                )}
                {pair.status === 'unmatched' && (
                  <Button size="sm" variant="secondary">
                    Find Invoice
                  </Button>
                )}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function InvoiceTab() {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/[0.06]">
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Reference</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">From</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Network</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Date</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
          {invoices.map((inv) => (
            <tr
              key={inv.ref}
              className={`hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer
                ${inv.status === 'partial' ? 'bg-amber-50/40 dark:bg-amber-500/[0.04]' : ''}`}
            >
              <td className="px-4 py-2.5 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{inv.ref}</td>
              <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{inv.from}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                {inv.amount} <span className="text-gray-400 font-normal">{inv.currency}</span>
              </td>
              <td className="px-4 py-2.5"><PoolTag network={inv.network} /></td>
              <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{inv.date}</td>
              <td className="px-4 py-2.5"><StatusBadge status={inv.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function BillsTab() {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/[0.06]">
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Reference</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Vendor</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Network</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Date</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
          {bills.map((bill) => (
            <tr key={bill.ref} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer">
              <td className="px-4 py-2.5 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{bill.ref}</td>
              <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{bill.vendor}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                {bill.amount} <span className="text-gray-400 font-normal">{bill.currency}</span>
              </td>
              <td className="px-4 py-2.5"><PoolTag network={bill.network} /></td>
              <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{bill.date}</td>
              <td className="px-4 py-2.5"><StatusBadge status={bill.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function MatchedTab() {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/[0.06]">
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Invoice / Bill</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Counterparty</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">TX Hash</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Network</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
          {matchedItems.map((item) => (
            <tr key={item.ref} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer">
              <td className="px-4 py-2.5 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.ref}</td>
              <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{item.from}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                {item.amount} <span className="text-gray-400 font-normal">{item.currency}</span>
              </td>
              <td className="px-4 py-2.5 font-mono text-gray-400 whitespace-nowrap">{item.hash}</td>
              <td className="px-4 py-2.5"><PoolTag network={item.network} /></td>
              <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function TransactionsTab() {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/[0.06]">
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">TX Hash</th>
            <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Network</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Date</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Matched To</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
          {transactions.map((tx) => (
            <tr key={tx.hash} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer">
              <td className="px-4 py-2.5 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{tx.hash}</td>
              <td className={`px-4 py-2.5 text-right font-semibold whitespace-nowrap
                ${tx.amount.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {tx.amount} <span className="text-gray-400 font-normal">{tx.currency}</span>
              </td>
              <td className="px-4 py-2.5"><PoolTag network={tx.network} /></td>
              <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{tx.date}</td>
              <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                {tx.label ?? <span className="italic text-gray-300 dark:text-gray-600">—</span>}
              </td>
              <td className="px-4 py-2.5"><StatusBadge status={tx.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Reconciliation() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('reconcile')

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">
            {t('page.reconciliation')}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{t('page.reconciliationSub')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            2 {t('recon.unmatched')}
          </Badge>
          <Button variant="secondary" size="sm">
            <Download className="w-3.5 h-3.5" />
            {t('action.exportcsv')}
          </Button>
        </div>
      </div>

      {/* ── Action bar ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3 hover:bg-orange-50/40 dark:hover:bg-orange-500/5 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('recon.uploadinvoice')}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{t('recon.ar')}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto shrink-0" />
        </Card>
        <Card className="p-4 flex items-center gap-3 hover:bg-violet-50/20 dark:hover:bg-violet-500/5 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('recon.uploadbill')}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{t('recon.ap')}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto shrink-0" />
        </Card>
        <Card className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('recon.lastsynced')}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Mar 31, 2026 · 14:32 UTC</p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            <RefreshCw className="w-3 h-3" />
            {t('action.refresh')}
          </Button>
        </Card>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-gray-100 dark:border-white/[0.08] overflow-x-auto">
        {tabs.map(({ key, i18n }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px
              ${activeTab === key
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {t(i18n)}
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      {activeTab === 'reconcile'    && <ReconcileTab />}
      {activeTab === 'invoice'      && <InvoiceTab />}
      {activeTab === 'bills'        && <BillsTab />}
      {activeTab === 'matched'      && <MatchedTab />}
      {activeTab === 'transactions' && <TransactionsTab />}

    </div>
  )
}
