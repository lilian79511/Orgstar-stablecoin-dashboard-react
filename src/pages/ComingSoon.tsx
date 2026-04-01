import { Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface Props { title: string }

export default function ComingSoon({ title }: Props) {
  return (
    <div className="p-6">
      <Card className="p-12 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
          <Clock className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="font-grotesk font-semibold text-lg text-gray-900 dark:text-white mb-1">{title}</h2>
          <p className="text-sm text-gray-400">This page is coming soon.</p>
        </div>
      </Card>
    </div>
  )
}
