import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Plus, ChevronUp, ChevronDown as ChevronDownIcon, X,
  Users, Paperclip, Zap, Send,
} from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { PaymentDrawer } from '@/components/payments/PaymentDrawer'

// ── Types ────────────────────────────────────────────────────────────────────
type PayStatus = 'pending-manager' | 'awaiting-sig' | 'rejected' | 'paid'

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
const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'p1', ref: 'PAY-20260318-001', payee: 'Vendor Inc', amount: 30000, currency: 'USDC',
    purpose: 'Software License', status: 'pending-manager',
    deadline: 'Mar 25, 2026', deadlineExpired: false,
    createdDate: 'Mar 18, 2026', createdTime: '14:02', createdBy: '陳琳達',
    toAddress: '0x9f8e7d6c5b4a3f2e1d0c9e8f7a6b5c4d3e2f1a0b',
    policyKyt: true, policyLiquidity: true, policyDoa: 'Manager',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: '陳琳達', date: 'Mar 18 · 14:02', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'awaiting', name: '王大明',                   note: 'Required — amount ≥ $1,000' },
      { role: 'CFO',                status: 'queued',   name: '李財長',                        note: 'Not required for this amount' },
    ],
  },
  {
    id: 'p2', ref: 'PAY-20260316-002', payee: 'Shenzhen Parts Ltd', amount: 75000, currency: 'USDT',
    purpose: 'Raw Materials', status: 'pending-manager',
    deadline: 'Mar 22, 2026', deadlineExpired: true,
    createdDate: 'Mar 16, 2026', createdTime: '09:30', createdBy: '陳琳達',
    toAddress: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    policyKyt: true, policyLiquidity: false, policyDoa: 'CFO',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: '陳琳達',        date: 'Mar 16 · 09:30', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'approved', name: '王大明', date: 'Mar 17 · 11:00', note: 'Approved' },
      { role: 'CFO',                status: 'awaiting', name: '李財長',                              note: 'Required — amount ≥ $50,000' },
    ],
  },
  {
    id: 'p3', ref: 'PAY-20260315-003', payee: 'Global Imports Ltd', amount: 120000, currency: 'USDC',
    purpose: 'Q1 Inventory Purchase', status: 'pending-manager',
    deadline: 'Mar 20, 2026', deadlineExpired: true,
    createdDate: 'Mar 15, 2026', createdTime: '16:45', createdBy: 'Kevin Wu',
    toAddress: '0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    policyKyt: true, policyLiquidity: true, policyDoa: 'CFO',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: 'Kevin Wu',       date: 'Mar 15 · 16:45', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'approved', name: '王大明', date: 'Mar 16 · 10:20', note: 'Approved' },
      { role: 'CFO',                status: 'awaiting', name: '李財長',                              note: 'Required — amount ≥ $50,000' },
    ],
  },
  {
    id: 'p4', ref: 'PAY-20260313-004', payee: 'SaaS Corp', amount: 5000, currency: 'USDT',
    purpose: 'Annual Subscription', status: 'paid',
    deadline: 'Mar 18, 2026', deadlineExpired: false,
    createdDate: 'Mar 13, 2026', createdTime: '11:15', createdBy: 'Lillian Chen',
    toAddress: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    policyKyt: true, policyLiquidity: true, policyDoa: 'Manager',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: 'Lillian Chen',   date: 'Mar 13 · 11:15', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'approved', name: '王大明', date: 'Mar 14 · 09:00', note: 'Approved — payment executed' },
      { role: 'CFO',                status: 'queued',   name: '李財長',                              note: 'Not required for this amount' },
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
      { role: 'Manager',            status: 'rejected',  name: '王大明', date: 'Mar 13 · 10:30', note: 'KYT check failed — unknown counterparty' },
      { role: 'CFO',                status: 'queued',    name: '李財長',                              note: 'Not required for this amount' },
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
      { role: 'Manager',            status: 'queued',   name: '王大明',                       note: 'Not required for this amount' },
      { role: 'CFO',                status: 'queued',   name: '李財長',                            note: 'Not required for this amount' },
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
      { role: 'Manager',            status: 'approved', name: '王大明', date: 'Mar 11 · 09:00', note: 'Approved' },
      { role: 'CFO',                status: 'queued',   name: '李財長',                              note: 'Not required for this amount' },
    ],
  },
]

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<PayStatus, { label: string; cls: string; Icon: React.ElementType }> = {
  'pending-manager': { label: 'Pending',         cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',       Icon: Clock },
  'awaiting-sig':    { label: 'Awaiting Sig.',   cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',     Icon: Clock },
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

// ── Tab type ─────────────────────────────────────────────────────────────────
type TabKey = 'all' | 'awaiting-sig' | 'pending' | 'paid' | 'rejected'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'awaiting-sig', label: 'Awaiting Signature' },
  { key: 'pending',      label: 'Pending' },
  { key: 'paid',         label: 'Paid' },
  { key: 'rejected',     label: 'Rejected' },
]

// Returns payments visible to a role in a given tab.
// "Awaiting Signature" = it is THIS role's turn to act.
// "Pending"            = waiting for SOMEONE ELSE.
function getTabPayments(payments: Payment[], tab: TabKey, roleKey: string): Payment[] {
  const awaitingRole = (p: Payment) => p.chain.find((s) => s.status === 'awaiting')?.role ?? ''

  if (roleKey === 'auditor') {
    // Auditor only sees Paid
    return tab === 'paid' ? payments.filter((p) => p.status === 'paid') : []
  }

  switch (tab) {
    case 'all':
      // Finance never sees awaiting-sig (on-chain multi-sig is backend, not Finance's action)
      if (roleKey === 'finance') return payments.filter((p) => p.status !== 'awaiting-sig')
      return payments

    case 'awaiting-sig':
      // Finance: submitted the bills — nothing left to sign here; approvers handle it
      if (roleKey === 'finance') return []
      // Manager: pending-manager bills where the next awaiting approver is Manager
      if (roleKey === 'manager') return payments.filter(
        (p) => p.status === 'pending-manager' && awaitingRole(p) === 'Manager'
      )
      // CFO: pending-manager bills where the next awaiting approver is CFO
      if (roleKey === 'cfo') return payments.filter(
        (p) => p.status === 'pending-manager' && awaitingRole(p) === 'CFO'
      )
      return []

    case 'pending':
      // Finance: bills waiting for Manager/CFO approval — never show awaiting-sig to Finance
      if (roleKey === 'finance') return payments.filter((p) => p.status === 'pending-manager')
      // Manager: pending-manager bills where it is NOT Manager's turn (waiting for CFO etc.)
      if (roleKey === 'manager') return payments.filter(
        (p) => p.status === 'pending-manager' && awaitingRole(p) !== 'Manager'
      )
      // CFO: pending-manager bills where it is NOT CFO's turn
      if (roleKey === 'cfo') return payments.filter(
        (p) => p.status === 'pending-manager' && awaitingRole(p) !== 'CFO'
      )
      return payments.filter((p) => p.status === 'pending-manager')

    case 'paid':     return payments.filter((p) => p.status === 'paid')
    case 'rejected': return payments.filter((p) => p.status === 'rejected')
    default:         return payments
  }
}

type SortCol = 'created' | 'id' | 'payee' | 'amount' | 'deadline'

const CURRENCY_NETWORK_OPTIONS = [
  { value: 'USDC·ETH', label: 'USDC · Ethereum' },
  { value: 'USDC·POL', label: 'USDC · Polygon' },
  { value: 'USDC·SOL', label: 'USDC · Solana' },
  { value: 'USDT·TRX', label: 'USDT · Tron' },
]

const inputCls = 'px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors'

// ── Policy tier helper ────────────────────────────────────────────────────────
function getPolicyTier(amount: number): 1 | 2 | 3 {
  if (amount < 1000)  return 1
  if (amount <= 50000) return 2
  return 3
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Approvals() {
  const location = useLocation()
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS)
  const [tab,      setTab]      = useState<TabKey>('all')
  const [sortCol,  setSortCol]  = useState<SortCol>('created')
  const [sortDir,  setSortDir]  = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Payment | null>(null)
  const [payeeFilter, setPayeeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<PayStatus | ''>('')
  const [newBillOpen, setNewBillOpen] = useState(false)

  // New bill form state
  const [nbPayee, setNbPayee] = useState('')
  const [nbWallet, setNbWallet] = useState('')
  const [nbAmount, setNbAmount] = useState('')
  const [nbCN, setNbCN] = useState('USDC·ETH')
  const [nbPurpose, setNbPurpose] = useState('')
  const [nbDeadline, setNbDeadline] = useState('')

  const { showToast } = useUiStore()
  const { profile } = useUserStore()

  // Auto-open drawer when navigated from Dashboard
  useEffect(() => {
    const ref = (location.state as { openPaymentRef?: string } | null)?.openPaymentRef
    if (ref) {
      const p = payments.find((x) => x.ref === ref)
      if (p) setSelected(p)
      window.history.replaceState({}, '')
    }
  }, [location.state]) // eslint-disable-line react-hooks/exhaustive-deps

  const awaitingCount = getTabPayments(payments, 'awaiting-sig', profile.roleKey).length
  const pendingCount  = getTabPayments(payments, 'pending', profile.roleKey).length

  const parsedAmount = parseFloat(nbAmount) || 0
  const policyTier = getPolicyTier(parsedAmount)

  // ── Policy engine checks ─────────────────────────────────────────────────
  // KYT: wallet must be entered and look plausibly valid (0x… or T…)
  const walletTrimmed = nbWallet.trim()
  const kytPass = walletTrimmed.length >= 10 &&
    (walletTrimmed.startsWith('0x') || walletTrimmed.startsWith('T'))

  // Liquidity: compare amount against the treasury pool for the selected network
  const POOL_BALANCES: Record<string, number> = {
    'USDC·ETH': 250000,
    'USDC·POL': 100000,
    'USDC·SOL': 65000,
    'USDT·TRX': 85000,
  }
  const poolBalance = POOL_BALANCES[nbCN] ?? 0
  const liquidityChecked = parsedAmount > 0
  const liquidityOk = liquidityChecked && parsedAmount <= poolBalance

  function toggleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('desc')
    }
  }

  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col) return <span className="text-gray-300 dark:text-gray-600 ml-1">↕</span>
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 inline ml-1 text-orange-500" />
      : <ChevronDownIcon className="w-3 h-3 inline ml-1 text-orange-500" />
  }

  function sortPayments(list: Payment[]): Payment[] {
    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortCol === 'created') cmp = a.createdDate.localeCompare(b.createdDate)
      if (sortCol === 'id')      cmp = a.ref.localeCompare(b.ref)
      if (sortCol === 'payee')   cmp = a.payee.localeCompare(b.payee)
      if (sortCol === 'amount')  cmp = a.amount - b.amount
      if (sortCol === 'deadline') {
        const da = a.deadline ?? ''
        const db = b.deadline ?? ''
        cmp = da.localeCompare(db)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  const hasFilter = payeeFilter !== '' || statusFilter !== ''

  const visible = sortPayments(
    getTabPayments(payments, tab, profile.roleKey)
      .filter((p) => payeeFilter === '' || p.payee.toLowerCase().includes(payeeFilter.toLowerCase()))
      .filter((p) => statusFilter === '' || p.status === statusFilter)
  )

  function handleApprovePayment(id: string) {
    const now = new Date()
    const dateStr = `Apr 07 · ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const roleLabel = profile.roleKey === 'manager' ? 'Manager' : 'CFO'
    setPayments((prev) => prev.map((p) => {
      if (p.id !== id) return p
      const updatedChain = p.chain.map((step) => {
        if (step.role === roleLabel && step.status === 'awaiting') {
          return { ...step, status: 'approved' as const, date: dateStr, note: 'Approved' }
        }
        if (roleLabel === 'Manager' && step.role === 'CFO' && step.status === 'queued' && p.policyDoa === 'CFO') {
          return { ...step, status: 'awaiting' as const, note: 'Required — amount ≥ $50,000' }
        }
        return step
      })
      const stillAwaiting = updatedChain.some((s) => s.status === 'awaiting')
      return { ...p, chain: updatedChain, status: stillAwaiting ? 'pending-manager' : 'paid' }
    }))
  }

  function handleRejectPayment(id: string) {
    const now = new Date()
    const dateStr = `Apr 07 · ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const roleLabel = profile.roleKey === 'manager' ? 'Manager' : 'CFO'
    setPayments((prev) => prev.map((p) => {
      if (p.id !== id) return p
      const updatedChain = p.chain.map((step) => {
        if (step.role === roleLabel && step.status === 'awaiting') {
          return { ...step, status: 'rejected' as const, date: dateStr, note: 'Rejected' }
        }
        return step
      })
      return { ...p, chain: updatedChain, status: 'rejected' }
    }))
  }

  function getDisplayStatus(p: Payment): PayStatus {
    if (p.status !== 'pending-manager') return p.status
    const awaitingRole = p.chain.find((s) => s.status === 'awaiting')?.role ?? ''
    const isMyTurn =
      (profile.roleKey === 'manager' && awaitingRole === 'Manager') ||
      (profile.roleKey === 'cfo'     && awaitingRole === 'CFO')
    return isMyTurn ? 'awaiting-sig' : 'pending-manager'
  }

  function getRowAction(p: Payment) {
    // Auditor: always view-only
    if (profile.roleKey === 'auditor') return (
      <button
        onClick={(e) => { e.stopPropagation(); setSelected(p) }}
        className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
      >
        View
      </button>
    )

    // Manager/CFO see pending-manager bills in their "Awaiting Sig" tab — show Sign button
    if (p.status === 'pending-manager') {
      const awaitingStep = p.chain.find((s) => s.status === 'awaiting')
      const canSign =
        (profile.roleKey === 'manager' && awaitingStep?.role === 'Manager') ||
        (profile.roleKey === 'cfo' && awaitingStep?.role === 'CFO')
      if (canSign) return (
        <button
          onClick={(e) => { e.stopPropagation(); setSelected(p) }}
          className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
        >
          Sign
        </button>
      )
    }

    // awaiting-sig — Finance never sees these; other roles can view
    if (p.status === 'awaiting-sig') {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); setSelected(p) }}
          className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          View
        </button>
      )
    }
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

  function handleNewBillSubmit() {
    const currency = nbCN.split('·')[0] as 'USDC' | 'USDT'
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const seq = String(payments.length + 1).padStart(3, '0')
    const creatorName = profile.name || 'Finance Specialist'

    let chain: ApprovalStep[]
    let status: PayStatus
    let policyDoa: string

    if (policyTier === 1) {
      chain = [
        { role: 'Finance Specialist', status: 'approved', name: creatorName, date: `Apr 07 · ${timeStr}`, note: 'Submitted — auto-executed (amount < $1,000)' },
        { role: 'Manager', status: 'queued', name: '王大明', note: 'Not required for this amount' },
        { role: 'CFO', status: 'queued', name: '李財長', note: 'Not required for this amount' },
      ]
      status = 'paid'
      policyDoa = 'Finance'
    } else if (policyTier === 2) {
      chain = [
        { role: 'Finance Specialist', status: 'approved', name: creatorName, date: `Apr 07 · ${timeStr}`, note: 'Submitted for approval' },
        { role: 'Manager', status: 'awaiting', name: '王大明', note: 'Required — amount ≥ $1,000' },
        { role: 'CFO', status: 'queued', name: '李財長', note: 'Not required for this amount' },
      ]
      status = 'pending-manager'
      policyDoa = 'Manager'
    } else {
      chain = [
        { role: 'Finance Specialist', status: 'approved', name: creatorName, date: `Apr 07 · ${timeStr}`, note: 'Submitted for approval' },
        { role: 'Manager', status: 'awaiting', name: '王大明', note: 'Required — amount ≥ $1,000' },
        { role: 'CFO', status: 'queued', name: '李財長', note: 'Required — amount ≥ $50,000' },
      ]
      status = 'pending-manager'
      policyDoa = 'Manager + CFO'
    }

    const newPayment: Payment = {
      id: `p${Date.now()}`,
      ref: `PAY-20260407-${seq}`,
      payee: nbPayee.trim(),
      amount: parsedAmount,
      currency,
      purpose: nbPurpose.trim() || 'Payment',
      status,
      deadline: nbDeadline ? new Date(nbDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
      deadlineExpired: false,
      createdDate: 'Apr 07, 2026',
      createdTime: timeStr,
      createdBy: creatorName,
      toAddress: nbWallet.trim(),
      policyKyt: kytPass,
      policyLiquidity: liquidityOk,
      policyDoa,
      chain,
    }

    setPayments((prev) => [newPayment, ...prev])
    showToast(policyTier === 1 ? 'Payment submitted — executed automatically' : 'Payment request submitted for approval', 'success')
    setNewBillOpen(false)
    setNbPayee(''); setNbWallet(''); setNbAmount(''); setNbCN('USDC·ETH'); setNbPurpose(''); setNbDeadline('')
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
          onClick={() => setNewBillOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Bill
        </button>
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex items-center border-b border-gray-100 dark:border-white/[0.08] overflow-x-auto">
          {TABS.filter(({ key }) => {
            if (profile.roleKey === 'auditor') return key === 'paid'
            if (profile.roleKey === 'finance') return key !== 'awaiting-sig'
            return true
          }).map(({ key, label }) => {
            const badge = key === 'awaiting-sig' ? awaitingCount : key === 'pending' ? pendingCount : 0
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

      {/* Filter row */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={payeeFilter}
          onChange={(e) => setPayeeFilter(e.target.value)}
          placeholder="Filter by payee…"
          className={`${inputCls} w-48`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PayStatus | '')}
          className={inputCls}
        >
          <option value="">All Statuses</option>
          <option value="pending-manager">Pending</option>
          <option value="awaiting-sig">Awaiting Signature</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>
        {hasFilter && (
          <button
            onClick={() => { setPayeeFilter(''); setStatusFilter('') }}
            className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
      <div className="card bg-white dark:bg-[#1a1d27] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                {[
                  { label: 'Created',           col: 'created'  as SortCol, sortable: true },
                  { label: 'ID',                col: 'id'       as SortCol, sortable: true },
                  { label: 'Payee',             col: 'payee'    as SortCol, sortable: true },
                  { label: 'Amount',            col: 'amount'   as SortCol, sortable: true, right: true },
                  { label: 'Status',            col: null,                  sortable: false },
                  { label: 'Approval Deadline', col: 'deadline' as SortCol, sortable: true },
                  { label: '',                  col: null,                  sortable: false },
                ].map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    onClick={h.sortable && h.col ? () => toggleSort(h.col!) : undefined}
                    className={`px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-left whitespace-nowrap ${h.right ? 'text-right' : ''} ${h.sortable ? 'cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 select-none' : ''}`}
                  >
                    {h.label}
                    {h.sortable && h.col && <SortIcon col={h.col} />}
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
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusPill status={getDisplayStatus(p)} />
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
                  <td colSpan={7} className="px-5 py-10 text-center text-xs text-gray-400">
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
        <PaymentDrawer
          payment={selected}
          onClose={() => setSelected(null)}
          roleKey={profile.roleKey}
          onApprove={handleApprovePayment}
          onReject={handleRejectPayment}
        />
      )}

      {/* New Bill modal */}
      {newBillOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setNewBillOpen(false)}>
          <div className="modal-box w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
              <h3 className="font-grotesk font-semibold text-base text-gray-900 dark:text-white">New Bill</h3>
              <button onClick={() => setNewBillOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Payee / Vendor <span className="text-red-400">*</span></label>
                <input value={nbPayee} onChange={(e) => setNbPayee(e.target.value)} placeholder="e.g. Vendor Inc" className={`w-full ${inputCls}`} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Wallet Address <span className="text-red-400">*</span></label>
                <input value={nbWallet} onChange={(e) => setNbWallet(e.target.value)} placeholder="0x… or TQ…" className={`w-full font-mono ${inputCls}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Amount <span className="text-red-400">*</span></label>
                  <input type="number" value={nbAmount} onChange={(e) => setNbAmount(e.target.value)} placeholder="0.00" className={`w-full ${inputCls}`} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Currency &amp; Network <span className="text-red-400">*</span></label>
                  <select value={nbCN} onChange={(e) => setNbCN(e.target.value)} className={`w-full ${inputCls}`}>
                    {CURRENCY_NETWORK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Purpose / Description</label>
                <input value={nbPurpose} onChange={(e) => setNbPurpose(e.target.value)} placeholder="e.g. Software license" className={`w-full ${inputCls}`} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Payment Deadline</label>
                <input type="date" value={nbDeadline} onChange={(e) => setNbDeadline(e.target.value)} className={`w-full ${inputCls}`} />
              </div>

              {/* Policy Engine Preview */}
              <div className="rounded-lg border border-gray-100 dark:border-white/[0.08] bg-gray-50/60 dark:bg-white/[0.03] p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Policy Engine Preview</p>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  {/* KYT — only passes once wallet address is entered */}
                  {kytPass ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> KYT Pass
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-white/[0.07] text-gray-400 dark:text-gray-500">
                      <Clock className="w-3 h-3" /> KYT Pending
                    </span>
                  )}
                  {/* Liquidity — validates amount against pool balance */}
                  {!liquidityChecked ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-white/[0.07] text-gray-400 dark:text-gray-500">
                      <Clock className="w-3 h-3" /> Liquidity —
                    </span>
                  ) : liquidityOk ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Liquidity OK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                      <XCircle className="w-3 h-3" /> Insufficient Funds
                    </span>
                  )}
                  {policyTier === 1 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> DoA: Auto Execute
                    </span>
                  )}
                  {policyTier === 2 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      <Users className="w-3 h-3" /> DoA: Manager Approval
                    </span>
                  )}
                  {policyTier === 3 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400">
                      <Users className="w-3 h-3" /> DoA: Manager + CFO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  {!kytPass && 'Enter a wallet address to run KYT screening. '}
                  {liquidityChecked && !liquidityOk && `Insufficient balance — pool holds ${poolBalance.toLocaleString()} ${nbCN.split('·')[0]}. `}
                  {kytPass && liquidityOk && policyTier === 1 && 'Amount < $1,000 — no approval required, will execute immediately.'}
                  {kytPass && liquidityOk && policyTier === 2 && 'Amount $1k–$50k — requires one-level manager approval before execution.'}
                  {kytPass && liquidityOk && policyTier === 3 && 'Amount > $50,000 — requires dual approval from Manager and CFO.'}
                </p>
              </div>

              {/* Attach Documents */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  Attach Documents <span className="normal-case font-normal text-gray-400">(optional)</span>
                </p>
                <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg p-4 flex flex-col items-center gap-1.5 text-center cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/40 transition-colors">
                  <Paperclip className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-xs text-gray-400">Attach invoice, contract, PO, receipt</p>
                </div>
              </div>

              {/* Network fee — only for tier 1 */}
              {policyTier === 1 && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/[0.07] border border-blue-100 dark:border-blue-500/20">
                  <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">Estimated network fee</p>
                    <p className="text-[11px] text-blue-600/70 dark:text-blue-400/70 mt-0.5">≈ $0.50 USDC · charged from the sending wallet · actual fee may vary at time of broadcast</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 pb-5 border-t border-gray-100 dark:border-white/[0.06] pt-4">
              <button
                onClick={() => setNewBillOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNewBillSubmit}
                disabled={!nbPayee.trim() || !kytPass || !liquidityOk}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {policyTier === 1 ? 'Submit Payment' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
