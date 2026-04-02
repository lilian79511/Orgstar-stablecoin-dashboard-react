import { useState, useRef } from 'react'
import { X, Upload, CheckCircle2, LayoutDashboard, GitMerge, ChevronRight } from 'lucide-react'
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

export function OnboardingModal() {
  const { onboardingOpen, closeOnboarding, showToast } = useUiStore()
  const { profile, setProfile } = useUserStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [name, setName]       = useState(profile.name)
  const [roleKey, setRoleKey] = useState<RoleKey>(profile.roleKey)
  const [company, setCompany] = useState(profile.company)
  const [wallet, setWallet]   = useState('')
  const [invFile, setInvFile] = useState<File | null>(null)
  const [billFile, setBillFile] = useState<File | null>(null)
  const invRef  = useRef<HTMLInputElement>(null)
  const billRef = useRef<HTMLInputElement>(null)

  if (!onboardingOpen) return null

  function close() {
    closeOnboarding()
    setStep(1)
  }

  function next() { setStep((s) => Math.min(s + 1, 5)) }
  function skip() { next() }

  function finish(destination: 'dashboard' | 'reconcile') {
    // Save profile
    const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    setProfile({ name, roleKey, company, initials })
    showToast('Welcome to Orgstar! 🎉', 'success')
    close()
    if (destination === 'reconcile') navigate('/reconciliation')
    else navigate('/dashboard')
  }

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
              {step === 3 && 'Upload Invoice'}
              {step === 4 && 'Upload Bill'}
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
        <div className="p-5">

          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tell us a bit about yourself to personalise your experience.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500/60 transition-colors"
                    placeholder="e.g. Lillian Chen"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Your Role</label>
                  <select
                    value={roleKey}
                    onChange={(e) => setRoleKey(e.target.value as RoleKey)}
                    className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500/60 transition-colors"
                  >
                    {ROLE_OPTIONS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Company / Organisation</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500/60 transition-colors"
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
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Wallet Address</label>
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="0x… or TQ…"
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 font-mono focus:outline-none focus:border-orange-400 dark:focus:border-orange-500/60 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Ethereum', 'Polygon', 'Solana', 'Tron'].map((net, i) => (
                  <button
                    key={net}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors
                      ${['bg-blue-400','bg-violet-400','bg-emerald-400','bg-red-400'][i]}
                      border-gray-100 dark:border-white/[0.08] text-gray-700 dark:text-gray-300
                      hover:border-orange-300 dark:hover:border-orange-500/40 bg-white dark:bg-white/[0.03]`}
                  >
                    <span className={`w-2 h-2 rounded-full ${['bg-blue-400','bg-violet-400','bg-emerald-400','bg-red-400'][i]}`} />
                    {net}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Invoice */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload a sample invoice to see how Orgstar matches it to on-chain payments.</p>
              <div
                onClick={() => invRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors border-gray-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500/40 hover:bg-orange-50/30 dark:hover:bg-orange-500/5"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/8 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop invoice or <span className="text-orange-500">browse</span></p>
                  <p className="text-[11px] text-gray-400 mt-0.5">PDF, PNG, JPG, CSV</p>
                </div>
                <input ref={invRef} type="file" className="hidden" onChange={(e) => setInvFile(e.target.files?.[0] ?? null)} />
              </div>
              {invFile && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{invFile.name}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Bill */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload a bill or supplier invoice to track Accounts Payable.</p>
              <div
                onClick={() => billRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors border-gray-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/40 hover:bg-violet-50/30 dark:hover:bg-violet-500/5"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/8 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop bill or <span className="text-violet-500">browse</span></p>
                  <p className="text-[11px] text-gray-400 mt-0.5">PDF, PNG, JPG, CSV</p>
                </div>
                <input ref={billRef} type="file" className="hidden" onChange={(e) => setBillFile(e.target.files?.[0] ?? null)} />
              </div>
              {billFile && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{billFile.name}</p>
                </div>
              )}
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
            <button onClick={skip} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              Skip
            </button>
            <Button
              size="sm"
              disabled={step === 1 && !name.trim()}
              onClick={step === 3 && invFile ? next : step === 4 && billFile ? next : next}
            >
              {step === 3 && invFile ? 'Upload & Continue' : step === 4 && billFile ? 'Upload & Continue' : 'Continue'}
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
