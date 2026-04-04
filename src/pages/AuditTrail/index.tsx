import { useState } from 'react'
import { useUiStore } from '@/stores/uiStore'

type LogType = 'AP' | 'AR' | 'JE' | 'FV' | 'RECON' | 'TREASURY' | 'ALERT'

interface LogEntry {
  id: string
  ts: string
  operator: string
  action: string
  type: LogType
  details: string
  hash: string
}

const LOGS: LogEntry[] = [
  { id: 'LOG-013', ts: '2026-04-04 05:05', operator: '陳琳達', action: 'On-chain 簽名',    type: 'AP',       details: 'PAY-20260313-004 signed & submitted',                                              hash: 'd186ae2b' },
  { id: 'LOG-012', ts: '2026-03-26 09:15', operator: '陳琳達', action: 'Invoice 上傳',     type: 'AR',       details: 'ERP import: ASUSTek Corp, Foxconn Components — 2 inv…',                            hash: 'a3f8b1c2' },
  { id: 'LOG-011', ts: '2026-03-26 08:42', operator: '陳琳達', action: '分錄過帳',          type: 'JE',       details: 'JE-20260317-001 posted — Dr. 數位資產 12,000 USDT / Cr…',                          hash: '9d2e4f7a' },
  { id: 'LOG-010', ts: '2026-03-26 08:00', operator: 'System',  action: 'FX Rate 更新',    type: 'FV',       details: 'TWD/USD rate updated to 31.85 — portfolio unrealized G/L:…',                       hash: 'c5e1a8f3' },
  { id: 'LOG-009', ts: '2026-03-26 07:55', operator: '陳琳達', action: '對帳確認',          type: 'RECON',    details: 'INV-20260317-002 matched → 0x1a2b3c4d, FX diff -NT$…',                             hash: 'f7b3d091' },
  { id: 'LOG-008', ts: '2026-03-18 16:30', operator: '陳琳達', action: 'On-chain 簽名',    type: 'AP',       details: 'PAY-20260314-006 signed → tx 0x3c4d5e6f, 450 USDC s…',                             hash: '2a6c8e0b' },
  { id: 'LOG-007', ts: '2026-03-18 15:45', operator: 'CFO',     action: 'CFO 核准',        type: 'AP',       details: 'PAY-20260316-002 CFO approved, memo: "Confirmed sup…',                             hash: 'e4d2c9f1' },
  { id: 'LOG-006', ts: '2026-03-18 14:30', operator: 'Manager', action: '池充值',           type: 'TREASURY', details: 'Deposit 50,000 USDC → Ethereum pool, tx 0xfeed1234, blo…',                        hash: '7f3a5c1d' },
  { id: 'LOG-005', ts: '2026-03-18 14:15', operator: 'Manager', action: '核准付款',         type: 'AP',       details: 'PAY-20260316-002 approved → ready_to_execute, DoA: M…',                           hash: 'b8e6a2d4' },
  { id: 'LOG-004', ts: '2026-03-16 11:02', operator: 'System',  action: '異常偵測',        type: 'ALERT',    details: 'INV-003 金額不符：預期 5,000，偵測到 4,900 USDC — 差額…',                          hash: 'd1f9b4e7' },
  { id: 'LOG-003', ts: '2026-03-17 09:30', operator: 'System',  action: 'Invoice 收款完成', type: 'AR',       details: 'INV-20260317-002 completed — 12,000 USDT received, s…',                            hash: '6c8b2f5e' },
  { id: 'LOG-002', ts: '2026-03-18 14:02', operator: '陳琳達', action: '建立付款請求',      type: 'AP',       details: 'PAY-20260318-001 建立 — 30,000 USDC → Vendor Inc, Do…',                            hash: '4e9a7d3c' },
  { id: 'LOG-001', ts: '2026-03-18 10:05', operator: '陳琳達', action: '建立 Invoice',     type: 'AR',       details: 'INV-20260318-001 建立 — 5,000 USDC, client Acme Corp',                              hash: '1b5f8a2e' },
]

const TYPE_CLS: Record<LogType, string> = {
  AP:       'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400',
  AR:       'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  JE:       'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
  FV:       'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  RECON:    'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
  TREASURY: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  ALERT:    'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
}

const ALL_TYPES: LogType[] = ['AP', 'AR', 'JE', 'FV', 'RECON', 'TREASURY', 'ALERT']
const ALL_OPERATORS = [...new Set(LOGS.map((l) => l.operator))]

export default function AuditTrail() {
  const { showToast } = useUiStore()
  const [typeFilter,     setTypeFilter]     = useState<LogType | ''>('')
  const [operatorFilter, setOperatorFilter] = useState('')
  const [dateFrom,       setDateFrom]       = useState('')
  const [dateTo,         setDateTo]         = useState('')

  function reset() {
    setTypeFilter(''); setOperatorFilter(''); setDateFrom(''); setDateTo('')
  }

  const filtered = LOGS.filter((l) => {
    if (typeFilter && l.type !== typeFilter) return false
    if (operatorFilter && l.operator !== operatorFilter) return false
    if (dateFrom && l.ts < dateFrom) return false
    if (dateTo && l.ts > dateTo + ' 99:99') return false
    return true
  })

  const inputCls = 'px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors'

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">Audit Trail</h2>
          <p className="text-xs text-gray-400 mt-0.5">Immutable log of all system actions — SHA-256 hash verified</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Chain verified · Mar 26, 2026
          </span>
          <button
            onClick={() => showToast('CSV exported', 'success')}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as LogType | '')} className={inputCls}>
          <option value="">All Types</option>
          {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={operatorFilter} onChange={(e) => setOperatorFilter(e.target.value)} className={inputCls}>
          <option value="">All Operators</option>
          {ALL_OPERATORS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
        <input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   className={inputCls} />
        <button
          onClick={reset}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="card bg-white dark:bg-[#1a1d27] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                {['LOG ID', 'TIMESTAMP', 'OPERATOR', 'ACTION', 'TYPE', 'DETAILS', 'HASH', ''].map((h) => (
                  <th key={h} scope="col" className="px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-4 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{l.id}</td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{l.ts}</td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap font-medium">{l.operator}</td>
                  <td className={`px-5 py-4 whitespace-nowrap font-medium ${l.type === 'ALERT' ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {l.action}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_CLS[l.type]}`}>
                      {l.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">{l.details}</td>
                  <td className="px-5 py-4 font-mono text-gray-400 whitespace-nowrap">{l.hash}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button
                      onClick={() => showToast('Hash verified', 'success')}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      ○ Verify
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-xs text-gray-400">
                    No log entries match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="py-4 text-center">
          <button
            onClick={() => showToast('Loading earlier records…', 'info')}
            className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Load earlier records
          </button>
        </div>
      </div>

    </div>
  )
}
