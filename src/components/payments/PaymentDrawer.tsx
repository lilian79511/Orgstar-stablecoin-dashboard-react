import { useState } from 'react'
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Copy,
  Calendar,
} from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { useUiStore } from '@/stores/uiStore'
import type { Payment, ChainStep as ChainStepType } from '@/data/payments'

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
function ChainStep({ step, isLast, labelOverride }: { step: ChainStepType; isLast: boolean; labelOverride?: string }) {
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

  const badgeLabel = labelOverride ?? ({ approved: 'Approved', awaiting: 'Awaiting', queued: 'Queued', rejected: 'Rejected' }[step.status])

  const DotIcon = step.status === 'approved' ? CheckCircle2
    : step.status === 'rejected' ? XCircle
    : step.status === 'awaiting' ? Clock
    : null

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${dotCls}`}>
          {DotIcon && <DotIcon className="w-2.5 h-2.5 text-white" />}
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-200 dark:bg-white/10 mt-1 mb-1 min-h-[20px]" />}
      </div>
      <div className="pb-4">
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

// ── PaymentDrawer ─────────────────────────────────────────────────────────────
export function PaymentDrawer({ payment, onClose, roleKey, onApprove, onReject }: {
  payment: Payment | null
  onClose: () => void
  roleKey: string
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}) {
  const { showToast } = useUiStore()
  const [comment, setComment] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!payment) return null

  const awaitingStep = payment.chain.find((s) => s.status === 'awaiting')
  const isAwaitingSig = payment.status === 'awaiting-sig'

  function copyAddress() {
    navigator.clipboard.writeText(payment!.toAddress).then(() => showToast('Address copied', 'success'))
  }

  function handleApproveConfirm() {
    onApprove?.(payment!.id)
    showToast(`Payment ${payment!.ref} approved`, 'success')
    setConfirmOpen(false)
    onClose()
  }

  function handleReject() {
    onReject?.(payment!.id)
    showToast(`Payment ${payment!.ref} rejected`, 'error')
    onClose()
  }

  return (
    <Drawer isOpen={true} onClose={onClose} title={payment.ref} subtitle={payment.purpose}>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Payee</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{payment.payee}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Amount</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{payment.amount.toLocaleString()}</p>
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
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{payment.createdDate} · {payment.createdTime}</p>
          <p className="text-[10px] text-gray-400">by {payment.createdBy}</p>
        </div>
      </div>

      {/* To Address */}
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

      {/* Policy Checks */}
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

      {/* Approval Chain */}
      <div className="mb-5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Approval Chain</p>
        <div>
          {(() => {
            const visibleChain = payment.chain.filter((s) => s.status !== 'queued' || s.note.startsWith('Required'))
            const needsApproval = visibleChain.some((s) => s.role !== 'Finance Specialist')
            return visibleChain.map((step, i) => (
              <ChainStep
                key={step.role}
                step={step}
                isLast={i === visibleChain.length - 1}
                labelOverride={step.role === 'Finance Specialist' ? (needsApproval ? 'Created' : 'Paid') : undefined}
              />
            ))
          })()}
        </div>
      </div>

      {/* Approval Deadline */}
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

      {/* Footer: role-aware actions */}
      {(() => {
        const isMyTurn =
          (roleKey === 'manager' && awaitingStep?.role === 'Manager') ||
          (roleKey === 'cfo'     && awaitingStep?.role === 'CFO')
        const canAct = onApprove && onReject

        if (roleKey === 'finance') {
          const msg = isAwaitingSig
            ? 'All approvals complete. Payment is executing on-chain.'
            : awaitingStep
            ? `Submitted — awaiting approval from ${awaitingStep.name} (${awaitingStep.role}).`
            : null
          if (!msg) return null
          return (
            <div className="sticky bottom-0 bg-white dark:bg-[#1a1d27] border-t border-gray-100 dark:border-white/[0.06] pt-4 -mx-6 px-6 pb-1">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/[0.08] border border-blue-100 dark:border-blue-500/20 mb-4">
                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">{msg}</p>
              </div>
              <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mb-4">
                Close
              </button>
            </div>
          )
        }

        if ((isMyTurn || isAwaitingSig) && canAct) {
          return (
            <div className="sticky bottom-0 bg-white dark:bg-[#1a1d27] border-t border-gray-100 dark:border-white/[0.06] pt-4 -mx-6 px-6 pb-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)…"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors resize-none mb-3"
              />
              <div className="flex gap-2 mb-4">
                <button onClick={handleReject} className="flex-1 py-2.5 rounded-xl border border-red-200 dark:border-red-500/30 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors">
                  Reject
                </button>
                <button onClick={() => setConfirmOpen(true)} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
                  Approve
                </button>
              </div>
              {confirmOpen && (
                <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/40">
                  <div className="bg-white dark:bg-[#1a1d27] rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
                    <h4 className="font-grotesk font-semibold text-base text-gray-900 dark:text-white mb-2">Confirm Approval</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Are you sure you want to approve this payment?</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Once approved, this transaction will be sent to <strong className="text-gray-800 dark:text-gray-200">{payment.payee}</strong>.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                      <button onClick={handleApproveConfirm} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">Confirm & Approve →</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        }

        if (awaitingStep) {
          return (
            <div className="sticky bottom-0 bg-white dark:bg-[#1a1d27] border-t border-gray-100 dark:border-white/[0.06] pt-4 -mx-6 px-6 pb-1">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/[0.08] border border-amber-100 dark:border-amber-500/20 mb-4">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  Awaiting action from <strong>{awaitingStep.name}</strong> ({awaitingStep.role}).
                </p>
              </div>
              <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mb-4">Close</button>
            </div>
          )
        }

        return null
      })()}
    </Drawer>
  )
}
