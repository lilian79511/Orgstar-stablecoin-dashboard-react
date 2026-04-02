import { Drawer } from '@/components/ui/Drawer'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface InvoiceData {
  ref: string
  party: string
  sub: string          // due date or category
  amount: string
  currency: string
  type: 'invoice' | 'bill'
}

interface Props {
  isOpen: boolean
  onClose: () => void
  data: InvoiceData | null
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
      <span className="text-[11px] text-gray-400 shrink-0 w-28">{label}</span>
      <span className={`text-xs text-right text-gray-800 dark:text-gray-200 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
    </div>
  )
}

export function InvoiceDrawer({ isOpen, onClose, data }: Props) {
  if (!data) return null

  const isInvoice = data.type === 'invoice'
  const title = isInvoice ? 'Invoice Detail' : 'Bill Detail'
  const subtitle = data.ref

  // Derive extra display fields from the ref (demo data)
  const invoiceDetails = isInvoice
    ? {
        issueDate: 'Mar 16, 2026',
        paymentTerms: 'Net 30',
        currency: data.currency,
        bankAccount: '— (on-chain)',
        notes: 'Stablecoin payment accepted. Please remit USDC to the address on file.',
        status: data.sub.includes('Due') ? 'Awaiting Payment' : 'Paid',
      }
    : {
        issueDate: data.sub,
        paymentTerms: 'Due on receipt',
        currency: data.currency,
        bankAccount: '— (on-chain)',
        notes: 'Recurring service bill. AP workflow required.',
        status: 'Pending Approval',
      }

  const statusColor = invoiceDetails.status === 'Paid'
    ? 'text-emerald-600 dark:text-emerald-400'
    : invoiceDetails.status === 'Pending Approval'
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-blue-600 dark:text-blue-400'

  const StatusIcon = invoiceDetails.status === 'Paid' ? CheckCircle2
    : invoiceDetails.status === 'Pending Approval' ? AlertCircle
    : Clock

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle}>

      {/* Status banner */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5 text-xs font-semibold
        ${invoiceDetails.status === 'Paid'
          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : invoiceDetails.status === 'Pending Approval'
          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
          : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
        }`}
      >
        <StatusIcon className={`w-3.5 h-3.5 ${statusColor}`} />
        {invoiceDetails.status}
      </div>

      {/* Party & amount hero */}
      <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 mb-5">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">
          {isInvoice ? 'From' : 'To'}
        </p>
        <p className="text-base font-semibold text-gray-900 dark:text-white">{data.party}</p>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className={`font-grotesk text-2xl font-bold ${isInvoice ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {data.amount}
          </span>
          <span className="text-sm text-gray-400">{data.currency}</span>
        </div>
      </div>

      {/* Detail rows */}
      <div className="space-y-0">
        <Row label="Reference"     value={data.ref}                mono />
        <Row label={isInvoice ? 'Invoice Date' : 'Bill Date'} value={invoiceDetails.issueDate} />
        <Row label={isInvoice ? 'Due Date' : 'Category'}      value={data.sub} />
        <Row label="Payment Terms" value={invoiceDetails.paymentTerms} />
        <Row label="Currency"      value={data.currency} />
        <Row label="Payment"       value={invoiceDetails.bankAccount} />
      </div>

      {/* Notes */}
      {invoiceDetails.notes && (
        <div className="mt-5 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">Notes</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{invoiceDetails.notes}</p>
        </div>
      )}
    </Drawer>
  )
}
