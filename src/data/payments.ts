// ── Shared payment data & helpers ────────────────────────────────────────────

export type ChainStatus = 'approved' | 'awaiting' | 'queued' | 'rejected'

export interface ChainStep {
  role: string
  status: ChainStatus
  name: string
  date?: string
  note: string
}

export type PayStatus = 'pending-manager' | 'awaiting-sig' | 'rejected' | 'paid'

export interface Payment {
  id: string
  ref: string
  payee: string
  amount: number
  currency: string
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
  chain: ChainStep[]
}

export const PAYMENTS: Payment[] = [
  {
    id: 'p1', ref: 'PAY-20260318-001', payee: 'Vendor Inc', amount: 30000, currency: 'USDC',
    purpose: 'Software License', status: 'pending-manager',
    deadline: 'Mar 25, 2026', deadlineExpired: false,
    createdDate: 'Mar 18, 2026', createdTime: '14:02', createdBy: '陳琳達',
    toAddress: '0x9f8e7d6c5b4a3f2e1d0c9e8f7a6b5c4d3e2f1a0b',
    policyKyt: true, policyLiquidity: true, policyDoa: 'Manager',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: '陳琳達',  date: 'Mar 18 · 14:02', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'awaiting', name: '王大明',                           note: 'Required — amount ≥ $1,000' },
      { role: 'CFO',                status: 'queued',   name: '李財長',                            note: 'Not required for this amount' },
    ],
  },
  {
    id: 'p2', ref: 'PAY-20260316-002', payee: 'Shenzhen Parts Ltd', amount: 75000, currency: 'USDT',
    purpose: 'Raw Materials', status: 'pending-manager',
    deadline: 'Mar 22, 2026', deadlineExpired: true,
    createdDate: 'Mar 16, 2026', createdTime: '09:30', createdBy: '陳琳達',
    toAddress: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    policyKyt: true, policyLiquidity: false, policyDoa: 'Manager + CFO',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: '陳琳達',  date: 'Mar 16 · 09:30', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'approved', name: '王大明',  date: 'Mar 17 · 11:00', note: 'Approved' },
      { role: 'CFO',                status: 'awaiting', name: '李財長',                            note: 'Required — amount ≥ $50,000' },
    ],
  },
  {
    id: 'p3', ref: 'PAY-20260315-003', payee: 'Global Imports Ltd', amount: 120000, currency: 'USDC',
    purpose: 'Q1 Inventory Purchase', status: 'pending-manager',
    deadline: 'Mar 20, 2026', deadlineExpired: true,
    createdDate: 'Mar 15, 2026', createdTime: '16:45', createdBy: 'Kevin Wu',
    toAddress: '0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    policyKyt: true, policyLiquidity: true, policyDoa: 'Manager + CFO',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: 'Kevin Wu',  date: 'Mar 15 · 16:45', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'approved', name: '王大明',    date: 'Mar 16 · 10:20', note: 'Approved' },
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
      { role: 'Finance Specialist', status: 'approved', name: 'Lillian Chen', date: 'Mar 13 · 11:15', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'approved', name: '王大明',       date: 'Mar 14 · 09:00', note: 'Approved — payment executed' },
      { role: 'CFO',                status: 'queued',   name: '李財長',                               note: 'Not required for this amount' },
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
      { role: 'Finance Specialist', status: 'approved',  name: 'Sam Huang', date: 'Mar 12 · 14:50', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'rejected',  name: '王大明',    date: 'Mar 13 · 10:30', note: 'KYT check failed — unknown counterparty' },
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
      { role: 'Manager',            status: 'queued',   name: '王大明',                               note: 'Not required for this amount' },
      { role: 'CFO',                status: 'queued',   name: '李財長',                               note: 'Not required for this amount' },
    ],
  },
  {
    id: 'p7', ref: 'PAY-20260310-007', payee: 'AWS Services', amount: 2200, currency: 'USDC',
    purpose: 'Cloud Infrastructure', status: 'paid',
    deadline: 'Mar 15, 2026', deadlineExpired: false,
    createdDate: 'Mar 10, 2026', createdTime: '16:06', createdBy: 'Lillian Chen',
    toAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    policyKyt: true, policyLiquidity: true, policyDoa: 'Manager',
    chain: [
      { role: 'Finance Specialist', status: 'approved', name: 'Lillian Chen', date: 'Mar 10 · 16:06', note: 'Submitted for approval' },
      { role: 'Manager',            status: 'approved', name: '王大明',       date: 'Mar 11 · 09:00', note: 'Approved' },
      { role: 'CFO',                status: 'queued',   name: '李財長',                               note: 'Not required for this amount' },
    ],
  },
]

// ── Role-aware tab filter ─────────────────────────────────────────────────────
export type TabKey = 'all' | 'awaiting-sig' | 'pending' | 'paid' | 'rejected'

function awaitingRole(p: Payment): string {
  return p.chain.find((s) => s.status === 'awaiting')?.role ?? ''
}

export function getTabPayments(payments: Payment[], tab: TabKey, roleKey: string): Payment[] {
  if (roleKey === 'auditor') {
    return tab === 'paid' ? payments.filter((p) => p.status === 'paid') : []
  }

  switch (tab) {
    case 'all':
      if (roleKey === 'finance') return payments.filter((p) => p.status !== 'awaiting-sig')
      return payments

    case 'awaiting-sig':
      if (roleKey === 'finance') return []
      if (roleKey === 'manager') return payments.filter(
        (p) => p.status === 'pending-manager' && awaitingRole(p) === 'Manager'
      )
      if (roleKey === 'cfo') return payments.filter(
        (p) => p.status === 'pending-manager' && awaitingRole(p) === 'CFO'
      )
      return []

    case 'pending':
      if (roleKey === 'finance') return payments.filter((p) => p.status === 'pending-manager')
      if (roleKey === 'manager') return payments.filter(
        (p) => p.status === 'pending-manager' && awaitingRole(p) !== 'Manager'
      )
      if (roleKey === 'cfo') return payments.filter(
        (p) => p.status === 'pending-manager' && awaitingRole(p) !== 'CFO'
      )
      return payments.filter((p) => p.status === 'pending-manager')

    case 'paid':     return payments.filter((p) => p.status === 'paid')
    case 'rejected': return payments.filter((p) => p.status === 'rejected')
    default:         return payments
  }
}

// ── Dashboard: items needing action, ordered awaiting-sig first then pending ──
export function getDashboardPendingItems(roleKey: string): Payment[] {
  const awaiting = getTabPayments(PAYMENTS, 'awaiting-sig', roleKey)
  const pending  = getTabPayments(PAYMENTS, 'pending',      roleKey)
  // Deduplicate (pending-manager items could overlap)
  const seen = new Set(awaiting.map((p) => p.id))
  const uniquePending = pending.filter((p) => !seen.has(p.id))
  return [...awaiting, ...uniquePending]
}
