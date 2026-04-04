import { useState } from 'react'
import { X, CheckCircle2, LayoutDashboard, GitMerge, ChevronRight, FileText, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore, type RoleKey } from '@/stores/userStore'

const ROLE_OPTIONS: { key: RoleKey; label: string }[] = [
  { key: 'finance',  label: 'Finance Specialist' },
  { key: 'manager',  label: 'Department Manager' },
  { key: 'cfo',      label: 'Chief Financial Officer' },
  { key: 'auditor',  label: 'Auditor' },
]

const CURRENCY_NETWORK_OPTIONS = [
  { value: 'USDC·ETH', label: 'USDC · Ethereum' },
  { value: 'USDC·POL', label: 'USDC · Polygon' },
  { value: 'USDC·SOL', label: 'USDC · Solana' },
  { value: 'USDT·TRX', label: 'USDT · Tron' },
]

const emptyDoc = () => ({
  counterparty:    '',
  ref:             '',
  amount:          '',
  currencyNetwork: 'USDC·ETH',
  date:            '',
  dueDate:         '',
  category:        '',
  notes:           '',
})

export function OnboardingModal() {
  const { onboardingOpen, closeOnboarding, showToast } = useUiStore()
  const { profile, setProfile } = useUserStore()
  const navigate = useNavigate()

  const [step, setStep]       = useState(1)
  const [name, setName]       = useState(profile.name)
  const [roleKey, setRoleKey] = useState<RoleKey>(profile.roleKey)
  const [company, setCompany] = useState(profile.company)
  const [wallet, setWallet]   = useState('')
  const [invForm,  setInvForm]  = useState(emptyDoc)
  const [billForm, setBillForm] = useState(emptyDoc)

  if (!onboardingOpen) return null

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500/60 transition-colors'
  const labelCls = 'block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1'

  function setInv(field: string, value: string) {
    setInvForm((f) => ({ ...f, [field]: value }))
  }
  function setBill(field: string, value: string) {
    setBillForm((f) => ({ ...f, [field]: value }))
  }

  function close() {
    closeOnboarding()
    setStep(1)
  }

  function next() { setStep((s) => Math.min(s + 1, 5)) }
  function skip() { next() }

  function finish(destination: 'dashboard' | 'reconcile') {
    const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    setProfile({ name, roleKey, company, initials })
    showToast('Welcome to Orgstar! 🎉', 'success')
    close()
    if (destination === 'reconcile') navigate('/reconciliation')
    else navigate('/dashboard')
  }

  // Disable logic per step
  const step1Disabled = !name.trim() || !company.trim()
  const step2Disabled = !wallet.trim()

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal-box w-full max-w-lg" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide">Orgstar Setup</span>
            </div>
            <h3 className="font-grotesk font-semibold text-base text-gray-900 dark:text-white mt-0.5">
              {step === 1 && 'Welcome to Orgstar'}
              {step === 2 && 'Track Your Wallet'}
              {step === 3 && 'Add Invoice'}
              {step === 4 && 'Add Bill'}
              {step === 5 && "You're all set!"}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400">Step {step} / 5</span>
            <button onClick={close} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-gray-100 dark:bg-white/[0.06]">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Step content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto">

          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tell us a bit about yourself to personalise your experience.</p>
              <div className="space-y-3">
                <div>
                  <label htmlFor="ob-name" className={labelCls}>Your Name <span className="text-red-400">*</span></label>
                  <input
                    id="ob-name"
                    aria-required="true"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Lillian Chen"
                  />
                </div>
                <div>
                  <label htmlFor="ob-role" className={labelCls}>Your Role <span className="text-red-400">*</span></label>
                  <select
                    id="ob-role"
                    value={roleKey}
                    onChange={(e) => setRoleKey(e.target.value as RoleKey)}
                    className={inputCls}
                  >
                    {ROLE_OPTIONS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ob-company" className={labelCls}>Company / Organisation <span className="text-red-400">*</span></label>
                  <input
                    id="ob-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Nexora Technology Co., Ltd."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Wallet */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Connect a wallet address to track on-chain payments and reconcile transactions.</p>

              {/* Info box */}
              <div className="bg-blue-50 dark:bg-blue-500/[0.08] border border-blue-100 dark:border-blue-500/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">We track balances and transactions for the following tokens:</p>
                <ul className="space-y-0.5">
                  <li>• USDC · Ethereum &nbsp;&nbsp; • USDC · Polygon</li>
                  <li>• USDT · Ethereum &nbsp;&nbsp; • USDT · Tron</li>
                  <li>• USDC · Solana</li>
                </ul>
                <p className="mt-2 text-blue-600 dark:text-blue-400">Make sure your wallet address holds one or more of these tokens.</p>
              </div>

              <div>
                <label htmlFor="ob-wallet" className={labelCls}>Wallet Address <span className="text-red-400">*</span></label>
                <input
                  id="ob-wallet"
                  type="text"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="0x… or TQ…"
                  className={`${inputCls} font-mono`}
                />
              </div>
            </div>
          )}

          {/* Step 3: Invoice form */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter your first invoice to see how Orgstar matches it to on-chain payments.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ob-inv-party" className={labelCls}>Customer *</label>
                  <input id="ob-inv-party" value={invForm.counterparty} onChange={(e) => setInv('counterparty', e.target.value)}
                    placeholder="e.g. Acme Corp" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="ob-inv-ref" className={labelCls}>Reference No.</label>
                  <input id="ob-inv-ref" value={invForm.ref} onChange={(e) => setInv('ref', e.target.value)}
                    placeholder="INV-2026…" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ob-inv-amount" className={labelCls}>Amount *</label>
                  <input id="ob-inv-amount" aria-required="true" value={invForm.amount} onChange={(e) => setInv('amount', e.target.value)}
                    placeholder="0.00" type="number" min="0" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="ob-inv-cn" className={labelCls}>Currency &amp; Network *</label>
                  <select id="ob-inv-cn" value={invForm.currencyNetwork} onChange={(e) => setInv('currencyNetwork', e.target.value)} className={inputCls}>
                    {CURRENCY_NETWORK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ob-inv-date" className={labelCls}>Invoice Date</label>
                  <input id="ob-inv-date" value={invForm.date} onChange={(e) => setInv('date', e.target.value)} type="date" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="ob-inv-duedate" className={labelCls}>Due Date</label>
                  <input id="ob-inv-duedate" value={invForm.dueDate} onChange={(e) => setInv('dueDate', e.target.value)} type="date" className={inputCls} />
                </div>
              </div>

              <div>
                <label htmlFor="ob-inv-category" className={labelCls}>Description / Services</label>
                <input id="ob-inv-category" value={invForm.category} onChange={(e) => setInv('category', e.target.value)}
                  placeholder="e.g. Consulting services for Q1 2026" className={inputCls} />
              </div>
            </div>
          )}

          {/* Step 4: Bill form */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                  <Receipt className="w-3.5 h-3.5 text-violet-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add a supplier bill to track Accounts Payable.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ob-bill-party" className={labelCls}>Vendor *</label>
                  <input id="ob-bill-party" value={billForm.counterparty} onChange={(e) => setBill('counterparty', e.target.value)}
                    placeholder="e.g. AWS Services" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="ob-bill-ref" className={labelCls}>Reference No.</label>
                  <input id="ob-bill-ref" value={billForm.ref} onChange={(e) => setBill('ref', e.target.value)}
                    placeholder="PAY-2026…" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ob-bill-amount" className={labelCls}>Amount *</label>
                  <input id="ob-bill-amount" aria-required="true" value={billForm.amount} onChange={(e) => setBill('amount', e.target.value)}
                    placeholder="0.00" type="number" min="0" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="ob-bill-cn" className={labelCls}>Currency &amp; Network *</label>
                  <select id="ob-bill-cn" value={billForm.currencyNetwork} onChange={(e) => setBill('currencyNetwork', e.target.value)} className={inputCls}>
                    {CURRENCY_NETWORK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ob-bill-date" className={labelCls}>Bill Date</label>
                  <input id="ob-bill-date" value={billForm.date} onChange={(e) => setBill('date', e.target.value)} type="date" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="ob-bill-duedate" className={labelCls}>Payment Due</label>
                  <input id="ob-bill-duedate" value={billForm.dueDate} onChange={(e) => setBill('dueDate', e.target.value)} type="date" className={inputCls} />
                </div>
              </div>

              <div>
                <label htmlFor="ob-bill-category" className={labelCls}>Category</label>
                <input id="ob-bill-category" value={billForm.category} onChange={(e) => setBill('category', e.target.value)}
                  placeholder="e.g. Cloud Infrastructure" className={inputCls} />
              </div>
            </div>
          )}

          {/* Step 5: Done */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center py-4 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <p className="font-grotesk font-semibold text-gray-900 dark:text-white">All done, {name.split(' ')[0]}!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your workspace is ready. Where would you like to start?</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => finish('dashboard')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-white/[0.08] hover:border-orange-300 dark:hover:border-orange-500/40 hover:bg-orange-50/30 dark:hover:bg-orange-500/5 transition-colors"
                >
                  <LayoutDashboard className="w-6 h-6 text-orange-500" />
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Dashboard</span>
                </button>
                <button
                  onClick={() => finish('reconcile')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-white/[0.08] hover:border-orange-300 dark:hover:border-orange-500/40 hover:bg-orange-50/30 dark:hover:bg-orange-500/5 transition-colors"
                >
                  <GitMerge className="w-6 h-6 text-orange-500" />
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Reconcile</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 5 && (
          <div className="flex items-center justify-between px-5 pb-5 border-t border-gray-100 dark:border-white/[0.06] pt-4">
            {/* Steps 3 & 4 have skip; steps 1 & 2 do not */}
            {step >= 3 ? (
              <button onClick={skip} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                Skip
              </button>
            ) : (
              <span />
            )}
            <Button
              size="sm"
              disabled={step === 1 ? step1Disabled : step === 2 ? step2Disabled : false}
              onClick={next}
            >
              {(step === 3 && invForm.counterparty.trim() && invForm.amount.trim()) ||
               (step === 4 && billForm.counterparty.trim() && billForm.amount.trim())
                ? 'Save & Continue'
                : 'Continue'}
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
