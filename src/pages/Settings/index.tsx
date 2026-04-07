import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, ToggleLeft, ToggleRight, Building2, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/stores/uiStore'

interface JournalAccount {
  id: string
  name: string
  code: string
  enabled: boolean
}

const INITIAL_ACCOUNTS: JournalAccount[] = [
  { id: '1', name: 'Cash / USDC Wallet',     code: '1110', enabled: true },
  { id: '2', name: 'Accounts Receivable',     code: '1200', enabled: true },
  { id: '3', name: 'Accounts Payable',        code: '2100', enabled: true },
  { id: '4', name: 'FX Gain / Loss',          code: '6300', enabled: true },
  { id: '5', name: 'Stablecoin Reserve',      code: '1115', enabled: false },
]

const COUNTRY_OPTIONS = [
  'Taiwan', 'Hong Kong', 'Singapore', 'United States', 'United Kingdom',
  'Japan', 'South Korea', 'Australia', 'Canada', 'Germany',
]

const FX_OPTIONS = ['USDC/TWD', 'USDC/HKD', 'USDC/SGD', 'USDT/TWD', 'USDT/HKD']

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors'
const labelCls = 'block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1'

export default function Settings() {
  const { t } = useTranslation()
  const { showToast } = useUiStore()

  // Organisation profile
  const [companyName, setCompanyName] = useState('Next Chapter Studio')
  const [taxId,       setTaxId]       = useState('12345678')
  const [country,     setCountry]     = useState('Taiwan')
  const [fxPair,      setFxPair]      = useState('USDC/TWD')

  // Journal accounts
  const [accounts, setAccounts]         = useState<JournalAccount[]>(INITIAL_ACCOUNTS)
  const [newName,  setNewName]           = useState('')
  const [newCode,  setNewCode]           = useState('')

  function toggleAccount(id: string) {
    setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, enabled: !a.enabled } : a))
  }

  function deleteAccount(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }

  function addAccount() {
    if (!newName.trim() || !newCode.trim()) return
    setAccounts((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newName.trim(), code: newCode.trim(), enabled: true },
    ])
    setNewName('')
    setNewCode('')
  }

  function saveProfile() {
    showToast(t('toast.saved'), 'success')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">
          {t('nav.settings')}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Manage your organisation profile and accounting configuration</p>
      </div>

      {/* Organisation Profile */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <h3 className="font-grotesk font-semibold text-sm text-gray-900 dark:text-white">Organisation Profile</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Company Name</label>
            <input
              className={inputCls}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your company name"
            />
          </div>
          <div>
            <label className={labelCls}>Tax ID / Business No.</label>
            <input
              className={inputCls}
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="e.g. 12345678"
            />
          </div>
          <div>
            <label className={labelCls}>Country / Region</label>
            <select
              className={inputCls}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Default FX Pair</label>
            <select
              className={inputCls}
              value={fxPair}
              onChange={(e) => setFxPair(e.target.value)}
            >
              {FX_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={saveProfile}>Save Changes</Button>
        </div>
      </Card>

      {/* Journal Account Categories */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <h3 className="font-grotesk font-semibold text-sm text-gray-900 dark:text-white">Journal Account Categories</h3>
        </div>

        <div className="rounded-xl border border-gray-100 dark:border-white/[0.08] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02]">
                {['Code', 'Account Name', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">{acc.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{acc.name}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAccount(acc.id)}
                      className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                    >
                      {acc.enabled
                        ? <><ToggleRight className="w-4 h-4 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">Active</span></>
                        : <><ToggleLeft className="w-4 h-4 text-gray-400" /><span className="text-gray-400">Inactive</span></>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add account row */}
        <div className="flex items-end gap-2">
          <div className="w-24">
            <label className={labelCls}>Code</label>
            <input
              className={inputCls}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="1120"
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Account Name</label>
            <input
              className={inputCls}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Prepaid Expenses"
              onKeyDown={(e) => e.key === 'Enter' && addAccount()}
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={addAccount}
            disabled={!newName.trim() || !newCode.trim()}
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </div>
      </Card>
    </div>
  )
}
