import { useState } from 'react'
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Copy,
  PenLine, Plus, ChevronDown, Calendar,
} from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { useUiStore } from '@/stores/uiStore'

// ── Types ────────────────────────────────────────────────────────────────────
type PayStatus = 'pending-manager' | 'expired' | 'awaiting-sig' | 'rejected' | 'paid'

interface ApprovalStep {
  role: string
  status: 'approved' | 'awaiting' | 'queued' | 'rejected'
  name: string
  date?: string
  note: string
}

interface Payment {
  id: string
  ref: string
  payee: string
  amount: number
  currency: 'USDC' | 'USDT'
  purpose: string
  status: PayStatus
  deadline: string | null
  deadlineExpired: boolean
  createdDate: string
  createdTime: string
  createdBy: string
  toAddress: string
  policyKyt: boolean
  policyLiquidity: boolean
  policyDoa: string
  chain: ApprovalStep[]
}

// ── Data ─────────────────────────────────────────────────────────────────────
const PAYMENTS: Payment[] = [
  {
    id: 'p1', ref: 'PAY-20260318-001', payee: 'Vendor Inc', amount: 30000, currency: 'USDC',
    purpose: 'Software License', status: 'pending-manager',
    deadline: 'Mar 25, 2026', deadlineExpired: false,
    createdDate: 'Mar 18, 2026', createdTime: '14:02', createdBy: '陳琳達',
    toAddress: '0x9f8e7d6c5b4a3f2e1d0c9e8f7a6b5c4d3e2f1a0b',
    policyKyt: true, policyLiquidity: true, policyDoa: 'Manager',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: '陳琳達', date: 'Mar 18 · 14:02', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'awaiting', name: 'Wei-Ling Chang',                   note: 'Required — amount ≥ $1,000' },
      { role: 'CFO',                status: 'queued',   name: 'James Liu',                        note: 'Not required for this amount' },
    ],
  },
  {
    id: 'p2', ref: 'PAY-20260316-002', payee: 'Shenzhen Parts Ltd', amount: 75000, currency: 'USDT',
    purpose: 'Raw Materials', status: 'expired',
    deadline: 'Mar 22, 2026', deadlineExpired: true,
    createdDate: 'Mar 16, 2026', createdTime: '09:30', createdBy: '陳琳達',
    toAddress: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    policyKyt: true, policyLiquidity: false, policyDoa: 'CFO',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: '陳琳達',        date: 'Mar 16 · 09:30', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'approved', name: 'Wei-Ling Chang', date: 'Mar 17 · 11:00', note: 'Approved' },
      { role: 'CFO',                status: 'awaiting', name: 'James Liu',                              note: 'Required — amount ≥ $50,000' },
    ],
  },
  {
    id: 'p3', ref: 'PAY-20260315-003', payee: 'Global Imports Ltd', amount: 120000, currency: 'USDC',
    purpose: 'Q1 Inventory Purchase', status: 'expired',
    deadline: 'Mar 20, 2026', deadlineExpired: true,
    createdDate: 'Mar 15, 2026', createdTime: '16:45', createdBy: 'Kevin Wu',
    toAddress: '0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    policyKyt: true, policyLiquidity: true, policyDoa: 'CFO',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: 'Kevin Wu',       date: 'Mar 15 · 16:45', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'approved', name: 'Wei-Ling Chang', date: 'Mar 16 · 10:20', note: 'Approved' },
      { role: 'CFO',                status: 'awaiting', name: 'James Liu',                              note: 'Required — amount ≥ $50,000' },
    ],
  },
  {
    id: 'p4', ref: 'PAY-20260313-004', payee: 'SaaS Corp', amount: 5000, currency: 'USDT',
    purpose: 'Annual Subscription', status: 'awaiting-sig',
    deadline: 'Mar 18, 2026', deadlineExpired: false,
    createdDate: 'Mar 13, 2026', createdTime: '11:15', createdBy: 'Lillian Chen',
    toAddress: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    policyKyt: true, policyLiquidity: true, policyDoa: 'Manager',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: 'Lillian Chen',   date: 'Mar 13 · 11:15', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'approved', name: 'Wei-Ling Chang', date: 'Mar 14 · 09:00', note: 'Approved' },
      { role: 'CFO',                status: 'queued',   name: 'James Liu',                              note: 'Not required for this amount' },
    ],
  },
  {
    id: 'p5', ref: 'PAY-20260312-005', payee: 'Unknown Vendor', amount: 8000, currency: 'USDC',
    purpose: 'Consulting Fee', status: 'rejected',
    deadline: null, deadlineExpired: false,
    createdDate: 'Mar 12, 2026', createdTime: '14:50', createdBy: 'Sam Huang',
    toAddress: '0x9b0a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    policyKyt: false, policyLiquidity: true, policyDoa: 'Manager',
    chain: [
      { role: 'Finance Specialist', status: 'approved',  name: 'Sam Huang',      date: 'Mar 12 · 14:50', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'rejected',  name: 'Wei-Ling Chang', date: 'Mar 13 · 10:30', note: 'KYT check failed — unknown counterparty' },
      { role: 'CFO',                status: 'queued',    name: 'James Liu',                              note: 'Not required for this amount' },
    ],
  },
  {
    id: 'p6', ref: 'PAY-20260314-006', payee: 'Office Depot', amount: 450, currency: 'USDC',
    purpose: 'Office Supplies', status: 'paid',
    deadline: null, deadlineExpired: false,
    createdDate: 'Mar 14, 2026', createdTime: '10:00', createdBy: 'Lillian Chen',
    toAddress: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    policyKyt: true, policyLiquidity: true, policyDoa: 'Finance',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: 'Lillian Chen', date: 'Mar 14 · 10:00', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'queued',   name: 'Wei-Ling Chang',                       note: 'Not required for this amount' },
      { role: 'CFO',                status: 'queued',   name: 'James Liu',                            note: 'Not required for this amount' },
    ],
  },
  {
    id: 'p7', ref: 'PAY-20260310-007', payee: 'AWS Services', amount: 2200, currency: 'USDC',
    purpose: 'Cloud Infrastructure', status: 'paid',
    deadline: 'Mar 15, 2026', deadlineExpired: false,
    createdDate: 'Mar 10, 2026', createdTime: '16:06', createdBy: 'Lillian Chen',
    toAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    policyKyt: true, policyLiquidity: true, policyDoa: 'Finance',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: 'Lillian Chen',   date: 'Mar 10 · 16:06', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'approved', name: 'Wei-Ling Chang', date: 'Mar 11 · 09:00', note: 'Approved' },
      { role: 'CFO',                status: 'queued',   name: 'James Liu',                              note: 'Not required for this amount' },
    ],
  },
]

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<PayStatus, { label: string; cls: string; Icon: React.ElementType }> = {
  'pending-manager': { label: 'Pending Manager', cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',       Icon: Clock },
  'expired':         { label: 'Expired',         cls: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',               Icon: Clock },
  'awaiting-sig':    { label: 'Awaiting Sig.',   cls: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400',   Icon: PenLine },
  'rejected':        { label: 'Rejected',        cls: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',               Icon: XCircle },
  'paid':            { label: 'Paid',            cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', Icon: CheckCircle2 },
}

function StatusPill({ status }: { status: PayStatus }) {
  const { label, cls, Icon } = STATUS_CFG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      <Icon className="w-2.5 h-2.5" />{label}
    </span>
  )
}

// ── Fake QR Code ─────────────────────────────────────────────────────────────
function QRCode() {
  const rows = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,1,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,0,1,0,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0],
    [1,0,1,0,1,1,0,1,0,1,0,0,1,0,1,1,0,1,0],
    [0,1,0,0,1,0,1,0,1,1,0,1,0,1,0,0,1,0,1],
    [1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,0,1,1,0],
    [0,1,0,1,0,1,1,0,0,0,1,1,0,1,0,1,0,0,1],
    [1,1,0,0,1,0,0,1,1,1,0,0,1,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,1,0,1,0,0,1,0,0,1,0],
    [1,1,1,1,1,1,1,0,1,0,0,0,1,1,0,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1],
  ]
  return (
    <div className="inline-block bg-white p-2 rounded-lg border border-gray-100">
      {rows.map((row, i) => (
        <div key={i} className="flex">
          {row.map((cell, j) => (
            <div key={j} style={{ width: 6, height: 6, background: cell ? '#111827' : '#fff' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Approval chain step ───────────────────────────────────────────────────────
function ChainStep({ step, isLast }: { step: ApprovalStep; isLast: boolean }) {
  const dotCls = {
    approved: 'bg-emerald-500 border-emerald-500',
    awaiting:  'bg-white border-amber-400',
    queued:    'bg-white border-gray-300 dark:border-white/20',
    rejected:  'bg-red-500 border-red-500',
  }[step.status]

  const badgeCls = {
    approved: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    awaiting:  'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
    queued:    'bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400',
    rejected:  'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  }[step.status]

  const badgeLabel = { approved: 'Approved', awaiting: 'Awaiting', queued: 'Queued', rejected: 'Rejected' }[step.status]

  const DotIcon = step.status === 'approved' ? CheckCircle2
    : step.status === 'rejected' ? XCircle
    : step.status === 'awaiting' ? Clock
    : null

  return (
    <div className="flex gap-3">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${dotCls}`}>
          {DotIcon && <DotIcon className="w-2.5 h-2.5 text-white" />}
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-200 dark:bg-white/10 mt-1 mb-1 min-h-[20px]" />}
      </div>
      {/* Content */}
      <div className={`pb-4 ${isLast ? '' : ''}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{step.role}</span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${badgeCls}`}>{badgeLabel}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.name}</p>
        {step.date && <p className="text-[10px] text-gray-400 mt-0.5">{step.date}</p>}
        <p className="text-[10px] text-gray-400 mt-0.5 italic">{step.note}</p>
      </div>
    </div>
  )
}

// ── Detail Drawer ────────────────────────────────────────────────────────────
function PaymentDrawer({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  const { showToast } = useUiStore()

  if (!payment) return null

  const awaitingStep = payment.chain.find((s) => s.status === 'awaiting')

  function copyAddress() {
    if (!payment) return
    navigator.clipboard.writeText(payment.toAddress).then(() => showToast('Address copied', 'success'))
  }

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      title={payment.ref}
      subtitle={payment.purpose}
    >
      {/* ── Details grid ── */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Payee</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{payment.payee}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Amount</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {payment.amount.toLocaleString()}
            </p>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />{payment.currency}
            </span>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Purpose</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{payment.purpose}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Created</p>
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
            {payment.createdDate} · {payment.createdTime}
          </p>
          <p className="text-[10px] text-gray-400">by {payment.createdBy}</p>
        </div>
      </div>

      {/* ── To Address ── */}
      <div className="mb-5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">To Address</p>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
          <p className="text-[11px] font-mono text-gray-700 dark:text-gray-300 flex-1 truncate">{payment.toAddress}</p>
          <button onClick={copyAddress} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-3 flex items-start gap-4">
          <QRCode />
          <button
            onClick={() => showToast('QR copied', 'success')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mt-1"
          >
            <Copy className="w-3 h-3" /> Copy QR
          </button>
        </div>
      </div>

      {/* ── Policy Checks ── */}
      <div className="mb-5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Policy Checks</p>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${payment.policyKyt ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
            {payment.policyKyt ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} KYT Pass
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${payment.policyLiquidity ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
            {payment.policyLiquidity ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Liquidity OK
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3" /> DoA: {payment.policyDoa}
          </span>
        </div>
      </div>

      {/* ── Approval Chain ── */}
      <div className="mb-5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Approval Chain</p>
        <div>
          {payment.chain.map((step, i) => (
            <ChainStep key={step.role} step={step} isLast={i === payment.chain.length - 1} />
          ))}
        </div>
      </div>

      {/* ── Approval Deadline ── */}
      {payment.deadline && (
        <div className="mb-6">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Approval Deadline</p>
          <div className={`flex items-center gap-1.5 text-sm font-semibold ${payment.deadlineExpired ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'}`}>
            <Calendar className="w-3.5 h-3.5" />
            {payment.deadline}
            {payment.deadlineExpired && <AlertTriangle className="w-3.5 h-3.5" />}
          </div>
        </div>
      )}

      {/* ── Footer notice ── */}
      {awaitingStep && (
        <div className="sticky bottom-0 bg-white dark:bg-[#1a1d27] border-t border-gray-100 dark:border-white/[0.06] pt-4 -mx-6 px-6 pb-1">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/[0.08] border border-amber-100 dark:border-amber-500/20 mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Awaiting action from <strong>{awaitingStep.name}</strong> ({awaitingStep.role}). You can review details but cannot sign on their behalf.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </Drawer>
  )
}

// ── Tab type ─────────────────────────────────────────────────────────────────
type TabKey = 'all' | 'todo' | 'waiting-sig' | 'paid' | 'rejected'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'todo',        label: 'To-do' },
  { key: 'waiting-sig', label: 'Waiting Signature' },
  { key: 'paid',        label: 'Paid' },
  { key: 'rejected',    label: 'Rejected' },
]

function tabFilter(p: Payment, tab: TabKey): boolean {
  if (tab === 'all')         return true
  if (tab === 'todo')        return p.status === 'pending-manager' || p.status === 'expired'
  if (tab === 'waiting-sig') return p.status === 'awaiting-sig'
  if (tab === 'paid')        return p.status === 'paid'
  if (tab === 'rejected')    return p.status === 'rejected'
  return true
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Approvals() {
  const [tab,     setTab]     = useState<TabKey>('all')
  const [sort,    setSort]    = useState<'newest' | 'oldest'>('newest')
  const [selected, setSelected] = useState<Payment | null>(null)
  const { showToast } = useUiStore()

  const todoCount   = PAYMENTS.filter((p) => tabFilter(p, 'todo')).length
  const waitingCount = PAYMENTS.filter((p) => tabFilter(p, 'waiting-sig')).length

  const visible = PAYMENTS
    .filter((p) => tabFilter(p, tab))
    .sort((a, b) => sort === 'newest'
      ? b.createdDate.localeCompare(a.createdDate)
      : a.createdDate.localeCompare(b.createdDate)
    )

  function getRowAction(p: Payment) {
    if (p.status === 'awaiting-sig') return (
      <button
        onClick={(e) => { e.stopPropagation(); showToast(`Signed ${p.ref}`, 'success') }}
        className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
      >
        Sign
      </button>
    )
    if (p.status === 'paid') return (
      <button
        onClick={(e) => { e.stopPropagation(); setSelected(p) }}
        className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
      >
        View
      </button>
    )
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setSelected(p) }}
        className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
      >
        Review
      </button>
    )
  }

  return (
    <div className="p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">Approve Payments</h2>
          <p className="text-xs text-gray-400 mt-0.5">Outbound payments and approval status</p>
        </div>
        <button
          onClick={() => showToast('New Bill form coming soon', 'info')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Bill
        </button>
      </div>

      {/* Tabs + Sort */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-white/[0.08]">
        <div role="tablist" className="flex items-center overflow-x-auto">
          {TABS.map(({ key, label }) => {
            const badge = key === 'todo' ? todoCount : key === 'waiting-sig' ? waitingCount : 0
            return (
              <button
                key={key}
                role="tab"
                id={`tab-${key}`}
                aria-selected={tab === key}
                aria-controls={`panel-${key}`}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px
                  ${tab === key
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {label}
                {badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="shrink-0 pb-2">
          <button
            onClick={() => setSort((s) => s === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium"
          >
            {sort === 'newest' ? 'Newest first' : 'Oldest first'}
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
      <div className="card bg-white dark:bg-[#1a1d27] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                {['Created', 'ID', 'Payee', 'Amount', 'Purpose', 'Status', 'Approval Deadline', ''].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className={`px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-left whitespace-nowrap ${h === 'Amount' ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
              {visible.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4 text-gray-400 whitespace-nowrap">{p.createdDate}</td>
                  <td className="px-5 py-4 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{p.ref}</td>
                  <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{p.payee}</td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {p.amount.toLocaleString()}
                    </p>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />{p.currency}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">{p.purpose}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {p.deadline ? (
                      <span className={`flex items-center gap-1 text-xs font-medium ${p.deadlineExpired ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {p.deadline}
                        {p.deadlineExpired && <AlertTriangle className="w-3 h-3" />}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {getRowAction(p)}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-xs text-gray-400">
                    No payments in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <PaymentDrawer payment={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
