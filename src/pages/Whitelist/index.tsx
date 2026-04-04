import { Shield } from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'

type KytStatus = 'Verified' | 'Pending KYT'
type NetworkKey = 'ETH' | 'TRX' | 'POL' | 'SOL'
type CurrencyKey = 'USDC' | 'USDT'

interface WhitelistEntry {
  id: string
  name: string
  address: string
  network: NetworkKey
  currency: CurrencyKey
  kyt: KytStatus
  addedBy: string
  date: string
}

const WHITELIST: WhitelistEntry[] = [
  { id: 'WL-001', name: 'Vendor Inc',         address: '0x9f8e7d6c…', network: 'ETH', currency: 'USDC', kyt: 'Verified',    addedBy: '陳琳達', date: 'Mar 1'  },
  { id: 'WL-002', name: 'Shenzhen Parts Ltd', address: 'TQfaGh8k…',   network: 'TRX', currency: 'USDT', kyt: 'Verified',    addedBy: '陳琳達', date: 'Mar 5'  },
  { id: 'WL-003', name: 'Tech Supplies Co',   address: '0x2c3d4e5f…', network: 'ETH', currency: 'USDC', kyt: 'Verified',    addedBy: '王大明', date: 'Mar 10' },
  { id: 'WL-004', name: 'Global Trade Ltd',   address: '0xaaabbccc…', network: 'POL', currency: 'USDC', kyt: 'Pending KYT', addedBy: '陳琳達', date: 'Mar 15' },
]

const NETWORK_CLS: Record<NetworkKey, string> = {
  ETH: 'text-blue-600 dark:text-blue-400',
  TRX: 'text-red-600 dark:text-red-400',
  POL: 'text-violet-600 dark:text-violet-400',
  SOL: 'text-emerald-600 dark:text-emerald-400',
}

const CURRENCY_CLS: Record<CurrencyKey, string> = {
  USDC: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  USDT: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400',
}

export default function Whitelist() {
  const { showToast } = useUiStore()

  const thCls = 'px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-left whitespace-nowrap'
  const tdCls = 'px-5 py-4 text-sm'

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">Whitelist</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage approved payee addresses for the Policy Engine</p>
        </div>
        <button
          onClick={() => showToast('Add Recipient form coming soon', 'info')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
        >
          + Add Recipient
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/[0.08] border border-blue-100 dark:border-blue-500/20">
        <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          Only whitelisted addresses can receive payments. Addresses undergo KYT/AML screening via Chainalysis before approval.{' '}
          <span className="text-amber-600 dark:text-amber-400 font-semibold">Pending</span>{' '}
          addresses require admin verification before use.
        </p>
      </div>

      {/* Table */}
      <div className="card bg-white dark:bg-[#1a1d27] overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Approved Recipients</h3>
          <span className="text-xs font-semibold text-orange-500">{WHITELIST.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                {['Recipient', 'Wallet Address', 'Network · Currency', 'KYT Status', 'Added By', ''].map((h) => (
                  <th key={h} scope="col" className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
              {WHITELIST.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors">
                  <td className={tdCls}>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{entry.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{entry.id}</p>
                  </td>
                  <td className={`${tdCls} font-mono text-gray-500 dark:text-gray-400`}>{entry.address}</td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold ${NETWORK_CLS[entry.network]}`}>{entry.network}</span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${CURRENCY_CLS[entry.currency]}`}>{entry.currency}</span>
                    </div>
                  </td>
                  <td className={tdCls}>
                    {entry.kyt === 'Verified' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                        ○ Pending KYT
                      </span>
                    )}
                  </td>
                  <td className={tdCls}>
                    <p className="text-gray-700 dark:text-gray-300">{entry.addedBy}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{entry.date}</p>
                  </td>
                  <td className={`${tdCls} whitespace-nowrap`}>
                    {entry.kyt === 'Pending KYT' && (
                      <button
                        onClick={() => showToast(`Approved ${entry.name}`, 'success')}
                        className="text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors mr-3"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => showToast(`Removed ${entry.name}`, 'error')}
                      className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
