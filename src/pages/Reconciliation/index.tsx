import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, RefreshCw, Download, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

type Tab = 'reconcile' | 'matched' | 'invoice' | 'bills' | 'transactions'

const tabs: { key: Tab; i18n: string }[] = [
  { key: 'reconcile',    i18n: 'tab.reconcile' },
  { key: 'matched',      i18n: 'tab.matched' },
  { key: 'invoice',      i18n: 'tab.invoice' },
  { key: 'bills',        i18n: 'tab.bills' },
  { key: 'transactions', i18n: 'tab.transactions' },
]

export default function Reconciliation() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('reconcile')

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">
            {t('page.reconciliation')}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{t('page.reconciliationSub')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-2.5 h-2.5" />
            2 {t('recon.unmatched')}
          </Badge>
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4" />
            {t('action.exportcsv')}
          </Button>
        </div>
      </div>

      {/* Action bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3 hover:bg-orange-50/40 dark:hover:bg-orange-500/5 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('recon.uploadinvoice')}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{t('recon.ar')}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 hover:bg-violet-50/20 dark:hover:bg-violet-500/5 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('recon.uploadbill')}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{t('recon.ap')}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('recon.lastsynced')}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Mar 31, 2026 · 14:32 UTC</p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            <RefreshCw className="w-3 h-3" />
            {t('action.refresh')}
          </Button>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-gray-100 dark:border-white/8 overflow-x-auto">
        {tabs.map(({ key, i18n }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px
              ${activeTab === key
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {t(i18n)}
          </button>
        ))}
      </div>

      {/* Tab content placeholder */}
      <Card className="p-6 text-center">
        <p className="text-sm text-gray-400">
          {activeTab} tab — content migrating from HTML prototype.
        </p>
      </Card>
    </div>
  )
}
