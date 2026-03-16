import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrder, cancelOrder } from '../../api/orders'
import toast from 'react-hot-toast'
import { MapPin, Store } from 'lucide-react'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id!),
    select: r => r.data?.data,
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id!),
    onSuccess: () => {
      toast.success('Order cancelled')
      qc.invalidateQueries({ queryKey: ['order', id] })
      qc.invalidateQueries({ queryKey: ['myOrders'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Cannot cancel')
    },
  })

  if (isLoading) return <><Navbar /><Spinner text="Loading order…" /></>

  const canCancel = !['Delivered', 'Cancelled'].includes(order?.status ?? '')

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">Order Details</h1>
            <p className="text-muted text-xs font-mono mt-0.5">{order?.id}</p>
          </div>
          {order && <StatusBadge status={order.status} />}
        </div>

        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Store size={14} className="text-acid" />
            <span className="text-sm font-medium text-foreground">{order?.shopName}</span>
            <span className="ml-auto text-xs font-mono text-acid border border-acid/30 bg-acid/10 px-2 py-0.5 rounded-full">{order?.orderType}</span>
          </div>
          <p className="text-xs text-muted">Placed: {order && new Date(order.createdAt).toLocaleString()}</p>
          {order?.updatedAt && <p className="text-xs text-muted">Updated: {new Date(order.updatedAt).toLocaleString()}</p>}
        </div>

        <div className="card mb-4">
          <h2 className="section-title mb-3">Items</h2>
          {order?.items.map(item => (
            <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{item.productName}</p>
                <p className="text-xs text-muted">qty × {item.quantity}</p>
              </div>
              <span className="text-acid font-semibold">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3">
            <span className="text-muted text-sm">Total</span>
            <span className="text-foreground font-bold text-lg">₹{order?.totalAmount}</span>
          </div>
        </div>

        {order?.deliveryAddress && (
          <div className="card mb-4">
            <h2 className="section-title mb-2 flex items-center gap-1">
              <MapPin size={14} className="text-acid" /> Delivery Address
            </h2>
            <p className="text-sm text-foreground">{order.deliveryAddress.street}</p>
            <p className="text-xs text-muted">{order.deliveryAddress.city} — {order.deliveryAddress.pinCode}</p>
          </div>
        )}

        {canCancel && (
          <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}
            className="btn-secondary w-full text-red-400 border-red-500/30 hover:border-red-500/50">
            {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Order'}
          </button>
        )}
      </main>
      <BottomNav />
    </>
  )
}
