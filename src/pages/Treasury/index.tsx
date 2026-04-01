import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function Treasury() {
  const { t } = useTranslation()

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white">
            {t('page.treasury')}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{t('page.treasurySub')}</p>
        </div>
        <Button variant="secondary" size="sm">
          <Wallet className="w-3.5 h-3.5" />
          {t('action.changeWallet')}
        </Button>
      </div>
      <Card className="p-6 text-center">
        <p className="text-sm text-gray-400">Treasury pools — migrating from HTML prototype.</p>
      </Card>
    </div>
  )
}
