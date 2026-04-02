import { Drawer } from '@/components/ui/Drawer'
import { ArrowDown, ArrowUp, ExternalLink } from 'lucide-react'

interface TxData {
  hash: string
  time: string
  amount: string
  currency: string
  dir: 'received' | 'sent'
}

interface Props {
  isOpen: boolean
  onClose: () => void
  data: TxData | null
}

function Row({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
      <span className="text-[11px] text-gray-400 shrink-0 w-28">{label}</span>
      <span className={`text-xs text-right break-all text-gray-800 dark:text-gray-200 ${mono ? 'font-mono' : 'font-medium'} ${className ?? ''}`}>{value}</span>
    </div>
  )
}

export function TxDrawer({ isOpen, onClose, data }: Props) {
  if (!data) return null

  const isIn = data.dir === 'received'
  const dirLabel = isIn ? 'Received' : 'Sent'

  // Expand abbreviated hash for demo
  const fullHash = data.hash.includes('…')
    ? data.hash.replace('…', '1c2d3e4f5a6b7c8d9e0f')
    : data.hash

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Detail"
      subtitle={data.hash}
    >
      {/* Direction banner */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5 text-xs font-semibold
        ${isIn
          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
        }`}
      >
        {isIn ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
        {dirLabel}
      </div>

      {/* Amount hero */}
      <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 mb-5">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-2">Amount</p>
        <div className="flex items-baseline gap-1.5">
          <span className={`font-grotesk text-2xl font-bold ${isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {data.amount}
          </span>
          <span className="text-sm text-gray-400">{data.currency}</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">{data.time}</p>
      </div>

      {/* Detail rows */}
      <div className="space-y-0">
        <Row label="TX Hash"     value={fullHash}       mono />
        <Row label="Network"     value={data.currency === 'USDT' && data.hash.startsWith('T') ? 'Tron (TRX)' : 'Ethereum (ETH)'} />
        <Row label="Direction"   value={dirLabel} />
        <Row label="Status"      value="Confirmed" className="text-emerald-600 dark:text-emerald-400" />
        <Row label="Block"       value="19,502,874" />
        <Row label="Gas / Fee"   value="1.4 USDC" />
        <Row label="Timestamp"   value={data.time} />
      </div>

      {/* Explorer link */}
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="mt-5 flex items-center gap-2 text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        View on Block Explorer
      </a>
    </Drawer>
  )
}
