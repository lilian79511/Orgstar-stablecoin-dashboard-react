import { useTranslation } from 'react-i18next'
import { GitCompareArrows, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">
            {t('page.overview')}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{t('page.snapshot')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Wallet className="w-3.5 h-3.5" />
            {t('action.changeWallet')}
          </Button>
          <Button size="sm" onClick={() => navigate('/reconciliation')}>
            <GitCompareArrows className="w-3.5 h-3.5" />
            {t('action.reconcile')}
          </Button>
        </div>
      </div>

      {/* Stats placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Treasury', value: '125,000', sub: 'USDC · All networks', accent: 'orange' as const },
          { label: 'Unmatched Items', value: '2', sub: 'Needs reconciliation', accent: 'amber' as const },
          { label: 'Pending Approvals', value: '1', sub: 'Awaiting sign-off', accent: 'violet' as const },
        ].map((stat) => (
          <Card key={stat.label} accent={stat.accent} className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">{stat.label}</p>
            <p className="font-grotesk font-bold text-2xl text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-[11px] text-gray-400 mt-1">{stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* Placeholder content */}
      <Card className="p-6 text-center">
        <p className="text-sm text-gray-400">
          Dashboard content migrating from the HTML prototype — coming soon.
        </p>
      </Card>
    </div>
  )
}
