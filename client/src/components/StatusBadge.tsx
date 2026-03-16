import type { OrderStatus } from '../types'

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending:        'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Confirmed:      'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Reserved:       'bg-purple-500/15 text-purple-400 border-purple-500/30',
  OutForDelivery: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Delivered:      'bg-green-500/15 text-green-400 border-green-500/30',
  Cancelled:      'bg-red-500/15 text-red-400 border-red-500/30',
}

interface Props {
  status: string
}

export default function StatusBadge({ status }: Props) {
  const cls = STATUS_COLORS[status as OrderStatus] ?? 'bg-surface text-muted border-border'
  return (
    <span className={`inline-block text-xs font-mono px-2.5 py-1 rounded-full border ${cls}`}>
      {status}
    </span>
  )
}
