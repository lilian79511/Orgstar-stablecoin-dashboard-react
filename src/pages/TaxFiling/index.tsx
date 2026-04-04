import { useState } from 'react'
import { useUiStore } from '@/stores/uiStore'

type TabKey = '401' | '402'

const SALES_INVOICES = [
  { ref: 'INV-20260318-001', buyer: 'Acme Corp',        amount: 159250, tax: 7963,  gst: 'Incl.', status: 'Matched'  },
  { ref: 'INV-20260317-002', buyer: 'Global Trade Ltd', amount: 382200, tax: 19110, gst: 'Incl.', status: 'Pending'  },
  { ref: 'INV-20260310-003', buyer: 'Sunrise Imports',  amount: 95550,  tax: 4778,  gst: 'Excl.', status: 'Matched'  },
]

const PURCHASE_INVOICES = [
  { ref: 'PAY-202603-001', vendor: 'Vendor Inc',         amount: 127400, credit: 6370, dept: 'PROC', status: 'Deductible'     },
  { ref: 'PAY-202603-002', vendor: 'Tech Supplies Co',   amount: 108300, credit: 5415, dept: 'IT',   status: 'Deductible'     },
  { ref: 'PAY-202603-003', vendor: 'Shenzhen Parts Ltd', amount: 76100,  credit: 0,    dept: 'OPS',  status: 'Non-deductible' },
  { ref: 'PAY-202603-004', vendor: 'Global Trade Ltd',   amount: 129100, credit: 6455, dept: 'PROC', status: 'Deductible'     },
]

const FILING_HISTORY = [
  { period: 'Feb 2026',     form: '401', tax: 'NT$6,820',  filed: 'Mar 14, 2026', status: 'Accepted', receipt: 'MF-2026-02-88412' },
  { period: 'Jan 2026',     form: '401', tax: 'NT$9,140',  filed: 'Feb 12, 2026', status: 'Accepted', receipt: 'MF-2026-01-71203' },
  { period: 'Nov-Dec 2025', form: '402', tax: 'NT$14,560', filed: 'Jan 15, 2026', status: 'Accepted', receipt: 'MF-2025-ND-55891' },
]

export default function TaxFiling() {
  const { showToast } = useUiStore()
  const [tab, setTab] = useState<TabKey>('401')

  const thCls = 'px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-left whitespace-nowrap'
  const tdCls = 'px-5 py-4 text-sm'

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">Tax Filing (Taiwan)</h2>
          <p className="text-xs text-gray-400 mt-0.5">管業稅申報 — prepare &amp; submit 401/402 VAT returns to MoF e-filing portal</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('CSV exported', 'success')}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => showToast('Submitting to 財政部…', 'info')}
            className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
          >
            Submit to 財政部
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-100 dark:border-white/[0.08]">
        {([['401', '401 — Monthly'], ['402', '402 — Bi-monthly']] as [TabKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px
              ${tab === key
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Period + status row */}
      <div className="flex items-center gap-3 flex-wrap">
        <select className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-400 transition-colors">
          <option>March 2026 (due Apr 15)</option>
          <option>February 2026 (due Mar 15)</option>
        </select>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400">
          ○ Pending Submission
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Form {tab} {tab === '401' ? '(一般稅額申報書) — filed monthly by registered VAT taxpayers. Due by the 15th of the following month.' : '(簡易申報書) — filed bi-monthly by small businesses with sales ≤ NT$400,000/period.'}
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'SALES (銷項)',        value: 'NT$512,800', sub: '6 transactions',   highlight: false },
          { title: 'OUTPUT TAX (銷項稅)', value: 'NT$25,640',  sub: '5% of sales',      highlight: false },
          { title: 'INPUT TAX (進項稅)',  value: 'NT$18,290',  sub: '4 deductible items', highlight: false },
          { title: 'NET TAX DUE (應繳)', value: 'NT$7,350',   sub: 'Output − Input',    highlight: true  },
        ].map((card) => (
          <div
            key={card.title}
            className={`card bg-white dark:bg-[#1a1d27] p-4 rounded-xl ${card.highlight ? 'border-2 border-orange-400 dark:border-orange-500/60' : ''}`}
          >
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{card.title}</p>
            <p className={`font-grotesk font-bold text-xl mt-1 ${card.highlight ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Sales Invoices */}
      <div className="card bg-white dark:bg-[#1a1d27] overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Sales Invoices (銷項憑證)</h3>
          <span className="text-xs font-semibold text-orange-500">{SALES_INVOICES.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                {['Invoice #', 'Buyer', 'Taxable Amt (NT$)', 'Tax (5%)', 'GST Flag', 'Status'].map((h) => (
                  <th key={h} scope="col" className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
              {SALES_INVOICES.map((inv) => (
                <tr key={inv.ref} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors">
                  <td className={`${tdCls} font-mono text-gray-500 dark:text-gray-400`}>{inv.ref}</td>
                  <td className={`${tdCls} font-medium text-gray-800 dark:text-gray-200`}>{inv.buyer}</td>
                  <td className={`${tdCls} text-gray-700 dark:text-gray-300`}>NT${inv.amount.toLocaleString()}</td>
                  <td className={`${tdCls} text-gray-700 dark:text-gray-300`}>NT${inv.tax.toLocaleString()}</td>
                  <td className={tdCls}>
                    <span className="px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10 text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                      {inv.gst}
                    </span>
                  </td>
                  <td className={tdCls}>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${inv.status === 'Matched' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Invoices */}
      <div className="card bg-white dark:bg-[#1a1d27] overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Purchase Invoices (進項憑證)</h3>
          <span className="text-xs font-semibold text-orange-500">{PURCHASE_INVOICES.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                {['Ref #', 'Vendor', 'Amt (NT$)', 'Tax Credit', 'Dept', 'Status'].map((h) => (
                  <th key={h} scope="col" className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
              {PURCHASE_INVOICES.map((p) => (
                <tr key={p.ref} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors">
                  <td className={`${tdCls} font-mono text-gray-500 dark:text-gray-400`}>{p.ref}</td>
                  <td className={`${tdCls} font-medium text-gray-800 dark:text-gray-200`}>{p.vendor}</td>
                  <td className={`${tdCls} text-gray-700 dark:text-gray-300`}>NT${p.amount.toLocaleString()}</td>
                  <td className={`${tdCls} text-gray-700 dark:text-gray-300`}>{p.credit > 0 ? `NT$${p.credit.toLocaleString()}` : '—'}</td>
                  <td className={`${tdCls} text-gray-500 dark:text-gray-400`}>{p.dept}</td>
                  <td className={tdCls}>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.status === 'Deductible' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filing History */}
      <div className="card bg-white dark:bg-[#1a1d27] overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/[0.06]">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Filing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                {['Period', 'Form', 'Net Tax', 'Filed On', 'Status', 'Receipt #'].map((h) => (
                  <th key={h} scope="col" className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
              {FILING_HISTORY.map((f) => (
                <tr key={f.receipt} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.03] transition-colors">
                  <td className={`${tdCls} font-medium text-gray-800 dark:text-gray-200`}>{f.period}</td>
                  <td className={`${tdCls} text-gray-500 dark:text-gray-400`}>{f.form}</td>
                  <td className={`${tdCls} font-semibold text-gray-800 dark:text-gray-200`}>{f.tax}</td>
                  <td className={`${tdCls} text-gray-500 dark:text-gray-400`}>{f.filed}</td>
                  <td className={tdCls}>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      ✓ {f.status}
                    </span>
                  </td>
                  <td className={`${tdCls} font-mono text-gray-400`}>{f.receipt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
