import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Upload, RefreshCw, Download, AlertCircle,
  ChevronRight, Repeat2, Search, FileQuestion,
  SearchX, CheckCircle2, Zap, Clock,
  ArrowDown, ArrowUp,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/stores/uiStore'
import { ChangeDocModal } from '@/components/modals/ChangeDocModal'
import { InvoiceDrawer } from '@/components/drawers/InvoiceDrawer'
import { TxDrawer } from '@/components/drawers/TxDrawer'

// ── Lookup tables for Change modal ──────────────────────────────────────────
const INV_LOOKUP: Record<string, { party: string; sub: string; amount: string; currency: string }> = {
  'INV-20260318-001': { party: 'Acme Corp',        sub: 'Due Apr 1, 2026',  amount: '5,000',  currency: 'USDC' },
  'INV-20260317-002': { party: 'Global Trade Ltd', sub: 'Due Mar 30, 2026', amount: '12,000', currency: 'USDC' },
  'INV-20260316-003': { party: 'Sunrise Imports',  sub: 'Due Mar 28, 2026', amount: '5,000',  currency: 'USDC' },
  'INV-20260322-004': { party: 'Delta Components', sub: 'Due Apr 5, 2026',  amount: '3,500',  currency: 'USDT' },
}
const BILL_LOOKUP: Record<string, { party: string; sub: string; amount: string; currency: string }> = {
  'PAY-20260310-007': { party: 'AWS Services', sub: 'Cloud Infrastructure', amount: '2,200', currency: 'USDC' },
  'PAY-20260314-006': { party: 'Office Depot',  sub: 'Office Supplies',     amount: '450',   currency: 'USDC' },
  'PAY-20260301-003': { party: 'Vendor Inc',    sub: 'SaaS Subscription',   amount: '8,750', currency: 'USDT' },
}
const TX_LOOKUP: Record<string, { time: string; amount: string; currency: string; dir: 'received' | 'sent' }> = {
  '0x5e6f7a8b9c0d1e2f…': { time: 'Mar 18 · 14:20 UTC', amount: '+5,000',  currency: 'USDC', dir: 'received' },
  '0x9a8b7c6d5e4f3a2b…': { time: 'Mar 16 · 11:02 UTC', amount: '+4,900',  currency: 'USDC', dir: 'received' },
  '0xb2d144fa…':         { time: 'Mar 20 · 09:15 UTC', amount: '+8,200',  currency: 'USDC', dir: 'received' },
  '0xa1b2c3d4e5f6a7b8…': { time: 'Mar 10 · 16:06 UTC', amount: '−2,200',  currency: 'USDC', dir: 'sent' },
  '0xe4f7a901…':         { time: 'Mar 17 · 10:05 UTC', amount: '+12,000', currency: 'USDC', dir: 'received' },
}

// ── Types ────────────────────────────────────────────────────────────────────
type Tab = 'reconcile' | 'matched' | 'invoice' | 'bills' | 'transactions'

const tabs: { key: Tab; label: string }[] = [
  { key: 'reconcile',    label: 'Reconcile' },
  { key: 'matched',      label: 'Matched' },
  { key: 'invoice',      label: 'Invoice' },
  { key: 'bills',        label: 'Bills' },
  { key: 'transactions', label: 'Transactions' },
]

// ── Helper: simple pill badge ────────────────────────────────────────────────
function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {children}
    </span>
  )
}

function PoolTag({ network }: { network: string }) {
  const map: Record<string, string> = {
    ETH: 'net-eth', POL: 'net-pol', SOL: 'net-sol', TRX: 'net-trx',
    USDC: 'cur-usdc', USDT: 'cur-usdt',
  }
  return <span className={`net-chip ${map[network] ?? ''}`}>{network}</span>
}


// ── Reconcile pairs data ─────────────────────────────────────────────────────
type DocSide = {
  type: 'invoice' | 'bill'
  ref: string
  party: string
  sub: string          // due date or category
  amount: string
  currency: string
  dir: 'received' | 'sent'
} | null

type TxSide = {
  hash: string
  time: string
  amount: string
  currency: string
  dir: 'received' | 'sent'
} | null

type PairStatus = 'suggested' | 'discrepancy' | 'no-doc' | 'no-tx' | 'awaiting' | 'confirmed'

interface Pair {
  id: string
  doc: DocSide
  tx: TxSide
  status: PairStatus
  note: string
  borderCls: string
  footerCls: string
}

const INITIAL_PAIRS: Pair[] = [
  {
    id: 'sunrise',
    doc: { type: 'invoice', ref: 'INV-20260316-003', party: 'Sunrise Imports', sub: 'Due Mar 28, 2026', amount: '5,000', currency: 'USDC', dir: 'received' },
    tx:  { hash: '0x9a8b7c6d5e4f3a2b…', time: 'Mar 16 · 11:02 UTC', amount: '+4,900', currency: 'USDC', dir: 'received' },
    status: 'discrepancy',
    note: 'Amount differs by −100 USDC (−2%)',
    borderCls: 'border border-amber-100 dark:border-amber-500/15',
    footerCls: 'border-t border-amber-100 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/[0.08]',
  },
  {
    id: 'no-inv',
    doc: null,
    tx:  { hash: '0xb2d144fa…', time: 'Mar 20 · 09:15 UTC', amount: '+8,200', currency: 'USDC', dir: 'received' },
    status: 'no-doc',
    note: 'Select an invoice above to enable confirmation',
    borderCls: 'border border-gray-100 dark:border-white/8',
    footerCls: 'border-t border-gray-100 dark:border-white/8 bg-gray-50/50 dark:bg-white/[0.04]',
  },
  {
    id: 'delta',
    doc: { type: 'invoice', ref: 'INV-20260322-004', party: 'Delta Components', sub: 'Due Apr 5, 2026', amount: '3,500', currency: 'USDT', dir: 'received' },
    tx:  null,
    status: 'no-tx',
    note: 'No on-chain transaction detected yet',
    borderCls: 'border border-gray-100 dark:border-white/8',
    footerCls: 'border-t border-gray-100 dark:border-white/8 bg-gray-50/50 dark:bg-white/[0.04]',
  },
  {
    id: 'aws',
    doc: { type: 'bill', ref: 'PAY-20260310-007', party: 'AWS Services', sub: 'Cloud Infrastructure', amount: '2,200', currency: 'USDC', dir: 'sent' },
    tx:  { hash: '0xa1b2c3d4e5f6a7b8…', time: 'Mar 10 · 16:06 UTC', amount: '−2,200', currency: 'USDC', dir: 'sent' },
    status: 'suggested',
    note: 'Exact match — 2,200 USDC',
    borderCls: 'border border-violet-100 dark:border-violet-500/15',
    footerCls: 'border-t border-violet-100 dark:border-violet-500/20 bg-violet-50/40 dark:bg-violet-500/[0.08]',
  },
  {
    id: 'office',
    doc: { type: 'bill', ref: 'PAY-20260314-006', party: 'Office Depot', sub: 'Office Supplies', amount: '450', currency: 'USDC', dir: 'sent' },
    tx:  null,
    status: 'awaiting',
    note: 'Select a transaction above to enable confirmation',
    borderCls: 'border border-gray-100 dark:border-white/8',
    footerCls: 'border-t border-gray-100 dark:border-white/8 bg-gray-50/50 dark:bg-white/[0.04]',
  },
]

// ── ReconcileTab ─────────────────────────────────────────────────────────────
function ReconcileTab() {
  const [pairs, setPairs] = useState<Pair[]>(INITIAL_PAIRS)
  const { showToast } = useUiStore()

  // Change picker modal
  const [changeModal, setChangeModal] = useState<{ pairId: string; mode: 'invoice' | 'bill' | 'tx'; currentRef: string } | null>(null)

  // Invoice / TX detail drawers
  const [invDrawer, setInvDrawer]  = useState<{ type: 'invoice' | 'bill'; ref: string; party: string; sub: string; amount: string; currency: string } | null>(null)
  const [txDrawer,  setTxDrawer]   = useState<{ hash: string; time: string; amount: string; currency: string; dir: 'received' | 'sent' } | null>(null)

  function confirm(id: string) {
    setPairs((prev) => prev.map((p) => p.id === id ? { ...p, status: 'confirmed' } : p))
  }

  function openChangeDoc(pairId: string, mode: 'invoice' | 'bill' | 'tx', currentRef: string) {
    setChangeModal({ pairId, mode, currentRef })
  }

  function handleChangeSelect(ref: string) {
    if (!changeModal) return
    const { pairId, mode } = changeModal
    // Actually update the pair data
    setPairs((prev) => prev.map((p) => {
      if (p.id !== pairId) return p
      if (mode === 'invoice') {
        const d = INV_LOOKUP[ref]
        if (!d) return p
        return { ...p, doc: { type: 'invoice', ref, party: d.party, sub: d.sub, amount: d.amount, currency: d.currency, dir: 'received' }, status: 'suggested' }
      }
      if (mode === 'bill') {
        const d = BILL_LOOKUP[ref]
        if (!d) return p
        return { ...p, doc: { type: 'bill', ref, party: d.party, sub: d.sub, amount: d.amount, currency: d.currency, dir: 'sent' }, status: p.tx ? 'suggested' : 'awaiting' }
      }
      if (mode === 'tx') {
        const d = TX_LOOKUP[ref]
        if (!d) return p
        return { ...p, tx: { hash: ref, time: d.time, amount: d.amount, currency: d.currency, dir: d.dir }, status: p.doc ? 'suggested' : 'no-doc' }
      }
      return p
    }))
    showToast(`Linked to ${ref}`, 'success')
    setChangeModal(null)
  }

  return (
    <>
      <div className="space-y-3">
        {pairs.map((pair) => {
          const isConfirmed = pair.status === 'confirmed'
          const docLabel = pair.doc?.type === 'bill' ? 'Bill (AP)' : 'Invoice (AR)'
          const txLabel  = pair.doc?.dir === 'sent' || pair.tx?.dir === 'sent'
            ? 'Transaction (Sent)' : 'Transaction (Received)'
          const docMode  = pair.doc?.type === 'bill' ? 'bill' : 'invoice'

          return (
            <div key={pair.id} className={`rounded-xl overflow-hidden bg-white dark:bg-[#1a1d27] ${isConfirmed ? 'opacity-60' : ''} ${pair.borderCls}`}>

              {/* ── Two-panel body ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-50 dark:divide-white/5">

                {/* Left: Doc (invoice / bill) */}
                {pair.doc ? (
                  <div
                    className="p-5 space-y-2 cursor-pointer hover:bg-orange-50/30 dark:hover:bg-orange-500/[0.04] transition-colors"
                    onClick={() => setInvDrawer({ type: pair.doc!.type, ref: pair.doc!.ref, party: pair.doc!.party, sub: pair.doc!.sub, amount: pair.doc!.amount, currency: pair.doc!.currency })}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">
                        {docLabel} <span className="normal-case tracking-normal font-normal text-gray-300 dark:text-gray-600">· click to view</span>
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); openChangeDoc(pair.id, docMode, pair.doc!.ref) }}
                        className="text-[10px] text-orange-500 hover:text-orange-600 font-medium flex items-center gap-0.5 transition-colors"
                      >
                        <Repeat2 className="w-3 h-3" /> Change
                      </button>
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-mono text-gray-400">{pair.doc.ref}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{pair.doc.party}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{pair.doc.sub}</p>
                      </div>
                      <p className={`text-sm font-semibold ${pair.doc.dir === 'sent' ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {pair.doc.amount} <span className="font-normal text-gray-400 text-xs">{pair.doc.currency}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Left: no doc empty state */
                  <div className="p-5 flex flex-col items-center justify-center min-h-[120px] text-center bg-gray-50/40 dark:bg-white/[0.03] space-y-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200/50 dark:bg-white/[0.07] flex items-center justify-center">
                      <FileQuestion className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400">No invoice matched</p>
                    <button
                      onClick={() => openChangeDoc(pair.id, 'invoice', '')}
                      className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Search className="w-3 h-3" /> Find Invoice
                    </button>
                  </div>
                )}

                {/* Right: Transaction */}
                {pair.tx ? (
                  <div
                    className="p-5 space-y-2 cursor-pointer hover:bg-blue-50/20 dark:hover:bg-blue-500/[0.04] transition-colors"
                    onClick={() => setTxDrawer({ hash: pair.tx!.hash, time: pair.tx!.time, amount: pair.tx!.amount, currency: pair.tx!.currency, dir: pair.tx!.dir })}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">
                        {txLabel} <span className="normal-case tracking-normal font-normal text-gray-300 dark:text-gray-600">· click to view</span>
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); openChangeDoc(pair.id, 'tx', pair.tx!.hash) }}
                        className="text-[10px] text-orange-500 hover:text-orange-600 font-medium flex items-center gap-0.5 transition-colors"
                      >
                        <Repeat2 className="w-3 h-3" /> Change
                      </button>
                    </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{pair.tx.hash}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{pair.tx.time}</p>
                    </div>
                    <p className={`text-sm font-semibold ${
                      pair.status === 'discrepancy' ? 'text-amber-600 dark:text-amber-400'
                      : pair.tx.amount.startsWith('−') ? 'text-red-500 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {pair.tx.amount} <span className="font-normal text-gray-400 text-xs">{pair.tx.currency}</span>
                    </p>
                  </div>
                </div>
              ) : (
                /* Right: no tx empty state */
                <div className="p-5 flex flex-col items-center justify-center min-h-[120px] text-center bg-gray-50/40 dark:bg-white/[0.03] space-y-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200/50 dark:bg-white/[0.07] flex items-center justify-center">
                    <SearchX className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400">
                    {pair.doc?.dir === 'sent' ? 'No outgoing transaction linked' : 'No transaction detected'}
                  </p>
                  <button
                    onClick={() => openChangeDoc(pair.id, 'tx', '')}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3" /> Find Transaction
                  </button>
                </div>
              )}
              </div>

              {/* ── Status bar ── */}
            <div className={`px-5 py-3 flex items-center justify-between gap-3 ${pair.footerCls}`}>

              {/* Left: status message */}
              <p className={`text-[11px] flex items-center gap-1.5 ${
                pair.status === 'discrepancy' ? 'text-amber-600 dark:text-amber-400'
                : pair.status === 'suggested' || isConfirmed ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 dark:text-gray-400'
              }`}>
                {pair.status === 'suggested' && <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /><Pill cls="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"><Zap className="w-2.5 h-2.5" />Suggested Match</Pill></>}
                {pair.status === 'discrepancy' && <><AlertCircle className="w-3.5 h-3.5 shrink-0" /><Pill cls="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">Discrepancy</Pill></>}
                {pair.status === 'no-doc' && <><Search className="w-3.5 h-3.5 shrink-0" /><Pill cls="bg-gray-200/50 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400">No Invoice Found</Pill></>}
                {pair.status === 'no-tx' && <><Clock className="w-3.5 h-3.5 shrink-0" /><Pill cls="bg-gray-200/50 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400">Awaiting Payment</Pill></>}
                {pair.status === 'awaiting' && <><Search className="w-3.5 h-3.5 shrink-0" /><Pill cls="bg-gray-200/50 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400">No Transaction Found</Pill></>}
                {isConfirmed && <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /><Pill cls="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Confirmed</Pill></>}
                {!isConfirmed && <span className="ml-1">{pair.note}</span>}
              </p>

              {/* Right: action button */}
              {isConfirmed ? (
                <span className="text-[11px] text-emerald-500 font-medium whitespace-nowrap">✓ Done</span>
              ) : pair.status === 'suggested' ? (
                <button
                  onClick={() => confirm(pair.id)}
                  className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3 h-3" /> Confirm Match
                </button>
              ) : pair.status === 'discrepancy' ? (
                <button
                  onClick={() => confirm(pair.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3 h-3" /> Confirm Partial
                </button>
              ) : (
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-400 text-xs font-semibold cursor-not-allowed whitespace-nowrap"
                >
                  Confirm Match
                </button>
              )}
            </div>

            </div>
          )
        })}
      </div>

      {/* Change picker modal */}
      {changeModal && (
        <ChangeDocModal
          isOpen={true}
          onClose={() => setChangeModal(null)}
          mode={changeModal.mode}
          currentRef={changeModal.currentRef}
          onSelect={handleChangeSelect}
        />
      )}

      {/* Invoice / Bill detail drawer */}
      <InvoiceDrawer
        isOpen={invDrawer !== null}
        onClose={() => setInvDrawer(null)}
        data={invDrawer}
      />

      {/* Transaction detail drawer */}
      <TxDrawer
        isOpen={txDrawer !== null}
        onClose={() => setTxDrawer(null)}
        data={txDrawer}
      />
    </>
  )
}

// ── Invoice tab ──────────────────────────────────────────────────────────────
const invoices = [
  { ref: 'INV-20260318-001', from: 'Acme Corp',        amount: '5,000',  currency: 'USDC', date: 'Mar 18, 2026', status: 'matched',  network: 'ETH' },
  { ref: 'INV-20260317-002', from: 'Global Trade Ltd', amount: '12,000', currency: 'USDC', date: 'Mar 17, 2026', status: 'matched',  network: 'ETH' },
  { ref: 'INV-20260316-003', from: 'Sunrise Imports',  amount: '5,000',  currency: 'USDC', date: 'Mar 16, 2026', status: 'partial',  network: 'ETH' },
  { ref: 'INV-20260322-004', from: 'Delta Components', amount: '3,500',  currency: 'USDT', date: 'Mar 22, 2026', status: 'awaiting', network: 'TRX' },
]

const statusCls: Record<string, string> = {
  matched:  'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  partial:  'bg-amber-50  dark:bg-amber-500/10  text-amber-700  dark:text-amber-400',
  awaiting: 'bg-gray-100  dark:bg-white/[0.07]  text-gray-500   dark:text-gray-400',
  pending:  'bg-blue-50   dark:bg-blue-500/10   text-blue-700   dark:text-blue-400',
}
const statusLabel: Record<string, string> = {
  matched: 'Matched', partial: 'Partially Matched', awaiting: 'Awaiting', pending: 'Pending',
}

function InvoiceTab() {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/[0.06]">
            {['Reference', 'From', 'Amount', 'Network', 'Date', 'Status', ''].map((h) => (
              <th key={h} className={`px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
          {invoices.map((inv) => (
            <tr key={inv.ref} className={`hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer ${inv.status === 'partial' ? 'bg-amber-50/30 dark:bg-amber-500/[0.04]' : ''}`}>
              <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{inv.ref}</td>
              <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{inv.from}</td>
              <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{inv.amount} <span className="text-gray-400 font-normal">{inv.currency}</span></td>
              <td className="px-4 py-3"><PoolTag network={inv.network} /></td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{inv.date}</td>
              <td className="px-4 py-3"><Pill cls={statusCls[inv.status] ?? statusCls.awaiting}>{statusLabel[inv.status] ?? inv.status}</Pill></td>
              <td className="px-4 py-3 text-right"><button className="text-[10px] text-orange-500 hover:text-orange-600 font-medium flex items-center gap-0.5 ml-auto"><Repeat2 className="w-3 h-3" /> Change</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// ── Bills tab ────────────────────────────────────────────────────────────────
const billRows = [
  { ref: 'PAY-20260310-007', vendor: 'AWS Services', sub: 'Cloud Infrastructure', amount: '2,200', currency: 'USDC', date: 'Mar 10, 2026', status: 'matched',  network: 'ETH' },
  { ref: 'PAY-20260314-006', vendor: 'Office Depot',  sub: 'Office Supplies',     amount: '450',   currency: 'USDC', date: 'Mar 14, 2026', status: 'awaiting', network: 'ETH' },
  { ref: 'PAY-20260301-003', vendor: 'Vendor Inc',    sub: 'SaaS Subscription',   amount: '8,750', currency: 'USDT', date: 'Mar 01, 2026', status: 'pending',  network: 'TRX' },
]

function BillsTab() {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/[0.06]">
            {['Reference', 'Vendor', 'Category', 'Amount', 'Network', 'Date', 'Status', ''].map((h) => (
              <th key={h} className={`px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
          {billRows.map((bill) => (
            <tr key={bill.ref} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer">
              <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{bill.ref}</td>
              <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{bill.vendor}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{bill.sub}</td>
              <td className="px-4 py-3 text-right font-semibold text-red-500 dark:text-red-400 whitespace-nowrap">{bill.amount} <span className="text-gray-400 font-normal">{bill.currency}</span></td>
              <td className="px-4 py-3"><PoolTag network={bill.network} /></td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{bill.date}</td>
              <td className="px-4 py-3"><Pill cls={statusCls[bill.status] ?? statusCls.awaiting}>{statusLabel[bill.status] ?? bill.status}</Pill></td>
              <td className="px-4 py-3 text-right"><button className="text-[10px] text-orange-500 hover:text-orange-600 font-medium flex items-center gap-0.5 ml-auto"><Repeat2 className="w-3 h-3" /> Change</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// ── Matched tab ──────────────────────────────────────────────────────────────
const matchedRows = [
  { ref: 'INV-20260318-001', party: 'Acme Corp',        amount: '5,000',  currency: 'USDC', hash: '0x5e6f7a8b9c0d1e2f…', date: 'Mar 18, 2026', network: 'ETH', dir: 'in' },
  { ref: 'INV-20260317-002', party: 'Global Trade Ltd', amount: '12,000', currency: 'USDC', hash: '0xe4f7a901…',         date: 'Mar 17, 2026', network: 'ETH', dir: 'in' },
  { ref: 'PAY-20260310-007', party: 'AWS Services',     amount: '2,200',  currency: 'USDC', hash: '0xa1b2c3d4e5f6a7b8…', date: 'Mar 10, 2026', network: 'ETH', dir: 'out' },
]

function MatchedTab() {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/[0.06]">
            {['Dir', 'Reference', 'Counterparty', 'Amount', 'TX Hash', 'Network', 'Date'].map((h) => (
              <th key={h} className={`px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
          {matchedRows.map((item) => (
            <tr key={item.ref} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer">
              <td className="px-4 py-3">
                {item.dir === 'in'
                  ? <Pill cls="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><ArrowDown className="w-2.5 h-2.5" />IN</Pill>
                  : <Pill cls="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300"><ArrowUp className="w-2.5 h-2.5" />OUT</Pill>
                }
              </td>
              <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.ref}</td>
              <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{item.party}</td>
              <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${item.dir === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {item.dir === 'in' ? '+' : '−'}{item.amount} <span className="text-gray-400 font-normal">{item.currency}</span>
              </td>
              <td className="px-4 py-3 font-mono text-gray-400 whitespace-nowrap">{item.hash}</td>
              <td className="px-4 py-3"><PoolTag network={item.network} /></td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// ── Transactions tab ─────────────────────────────────────────────────────────
const txRows = [
  { hash: '0x5e6f7a8b9c0d1e2f…', amount: '+5,000',  currency: 'USDC', date: 'Mar 18, 2026', status: 'matched',  network: 'ETH', label: 'Acme Corp · INV-20260318-001',    dir: 'in' },
  { hash: '0xe4f7a901…',         amount: '+12,000', currency: 'USDC', date: 'Mar 17, 2026', status: 'matched',  network: 'ETH', label: 'Global Trade · INV-20260317-002',  dir: 'in' },
  { hash: '0x9a8b7c6d5e4f3a2b…', amount: '+4,900',  currency: 'USDC', date: 'Mar 16, 2026', status: 'partial',  network: 'ETH', label: 'Sunrise Imports · partial',        dir: 'in' },
  { hash: '0xb2d144fa…',         amount: '+8,200',  currency: 'USDC', date: 'Mar 20, 2026', status: 'unmatched',network: 'ETH', label: null,                                dir: 'in' },
  { hash: '0xa1b2c3d4e5f6a7b8…', amount: '−2,200',  currency: 'USDC', date: 'Mar 10, 2026', status: 'matched',  network: 'ETH', label: 'AWS Services · PAY-20260310-007',  dir: 'out' },
]

const txStatusCls: Record<string, string> = {
  matched:   'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  partial:   'bg-amber-50  dark:bg-amber-500/10  text-amber-700  dark:text-amber-400',
  unmatched: 'bg-gray-100  dark:bg-white/[0.07]  text-gray-500   dark:text-gray-400',
}

function TransactionsTab() {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/[0.06]">
            {['Dir', 'TX Hash', 'Amount', 'Network', 'Date', 'Matched To', 'Status'].map((h) => (
              <th key={h} className={`px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
          {txRows.map((tx) => (
            <tr key={tx.hash} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer">
              <td className="px-4 py-3">
                {tx.dir === 'in'
                  ? <Pill cls="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><ArrowDown className="w-2.5 h-2.5" />IN</Pill>
                  : <Pill cls="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300"><ArrowUp className="w-2.5 h-2.5" />OUT</Pill>
                }
              </td>
              <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{tx.hash}</td>
              <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${tx.amount.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {tx.amount} <span className="text-gray-400 font-normal">{tx.currency}</span>
              </td>
              <td className="px-4 py-3"><PoolTag network={tx.network} /></td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{tx.date}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                {tx.label ?? <span className="italic text-gray-300 dark:text-gray-600">—</span>}
              </td>
              <td className="px-4 py-3"><Pill cls={txStatusCls[tx.status] ?? txStatusCls.unmatched}>{statusLabel[tx.status] ?? tx.status}</Pill></td>
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
  const { openModal, showToast } = useUiStore()

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">
            {t('page.reconciliation')}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{t('page.reconciliationSub')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-3 h-3" />
            2 {t('recon.unmatched')}
          </span>
          <Button variant="secondary" size="sm" onClick={() => showToast('CSV exported', 'success')}>
            <Download className="w-3.5 h-3.5" />
            {t('action.exportcsv')}
          </Button>
        </div>
      </div>

      {/* Action bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card onClick={() => openModal('upload-invoice')} className="p-4 flex items-center gap-3 hover:bg-orange-50/40 dark:hover:bg-orange-500/5 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('recon.uploadinvoice')}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{t('recon.ar')}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto shrink-0" />
        </Card>
        <Card onClick={() => openModal('upload-bill')} className="p-4 flex items-center gap-3 hover:bg-violet-50/20 dark:hover:bg-violet-500/5 transition-colors cursor-pointer">
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
          <Button variant="secondary" size="sm" onClick={() => showToast('Synced successfully', 'success')}>
            <RefreshCw className="w-3 h-3" />
            {t('action.refresh')}
          </Button>
        </Card>
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex items-center gap-0 border-b border-gray-100 dark:border-white/[0.08] overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            id={`tab-${key}`}
            aria-selected={activeTab === key}
            aria-controls={`panel-${key}`}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px
              ${activeTab === key
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'reconcile'    && <ReconcileTab />}
        {activeTab === 'invoice'      && <InvoiceTab />}
        {activeTab === 'bills'        && <BillsTab />}
        {activeTab === 'matched'      && <MatchedTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
      </div>

    </div>
  )
}
