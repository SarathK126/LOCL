import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRetailerOrders, updateOrderStatus } from '../../api/retailer'
import type { OrderStatus } from '../../types'
import toast from 'react-hot-toast'
import { ShoppingBag } from 'lucide-react'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import Navbar from '../../components/Navbar'

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  Pending:        ['Confirmed', 'Cancelled'],
  Confirmed:      ['Reserved', 'OutForDelivery', 'Cancelled'],
  Reserved:       ['Delivered', 'Cancelled'],
  OutForDelivery: ['Delivered', 'Cancelled'],
  Delivered:      [],
  Cancelled:      [],
}

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Reserved', 'OutForDelivery', 'Delivered', 'Cancelled']

export default function IncomingOrders() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<OrderStatus | 'All'>('All')

  const { data: orders, isLoading } = useQuery({
    queryKey: ['retailerOrders'],
    queryFn: getRetailerOrders,
    select: r => r.data?.data ?? [],
    refetchInterval: 15_000,
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['retailerOrders'] }) },
    onError: () => toast.error('Update failed'),
  })

  const filtered = orders?.filter(o => filter === 'All' || o.status === filter) ?? []

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <h1 className="text-xl font-bold text-foreground mb-4">Incoming Orders</h1>

        <div className="flex gap-2 flex-wrap mb-5">
          {(['All', ...ALL_STATUSES] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                filter === f ? 'bg-acid text-black border-acid' : 'border-border text-muted hover:border-acid/40'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {isLoading && <Spinner text="Loading orders…" />}
        {filtered.length === 0 && !isLoading && (
          <EmptyState icon={ShoppingBag} title="No orders" description="Orders will appear here" />
        )}

        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={order.status} />
                    <span className="text-xs font-mono text-acid border border-acid/30 bg-acid/10 px-2 py-0.5 rounded-full">{order.orderType}</span>
                  </div>
                  <p className="text-xs text-muted font-mono">{order.id.slice(0, 8)}…</p>
                </div>
                <span className="text-acid font-bold">₹{order.totalAmount}</span>
              </div>

              <div className="text-xs text-muted mb-3 space-y-0.5">
                {order.items.map(i => <p key={i.id}>{i.productName} × {i.quantity}</p>)}
              </div>

              {order.deliveryAddress && (
                <p className="text-xs text-muted mb-3">
                  📍 {order.deliveryAddress.street}, {order.deliveryAddress.city}
                </p>
              )}

              {NEXT_STATUSES[order.status as OrderStatus]?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {NEXT_STATUSES[order.status as OrderStatus].map(s => (
                    <button key={s} disabled={statusMut.isPending}
                      onClick={() => statusMut.mutate({ id: order.id, status: s })}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                        s === 'Cancelled'
                          ? 'border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20'
                          : 'border-acid/30 text-acid bg-acid/10 hover:bg-acid/20'
                      }`}>
                      → {s}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted mt-3">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
