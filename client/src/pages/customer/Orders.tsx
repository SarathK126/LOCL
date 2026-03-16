import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMyOrders } from '../../api/orders'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: getMyOrders,
    select: r => r.data?.data ?? [],
  })

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <h1 className="text-xl font-bold text-foreground mb-5">My Orders</h1>

        {isLoading && <Spinner text="Loading orders…" />}
        {orders?.length === 0 && (
          <EmptyState icon={ShoppingBag} title="No orders yet" description="Start shopping to see your orders here"
            action={<Link to="/search" className="btn-primary">Browse Products</Link>} />
        )}

        <div className="space-y-3">
          {orders?.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card flex items-center justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={order.status} />
                  <span className="text-xs font-mono text-acid px-2 py-0.5 bg-surface border border-border rounded-full">
                    {order.orderType}
                  </span>
                </div>
                <p className="font-medium text-foreground text-sm">{order.shopName}</p>
                <p className="text-muted text-xs mt-0.5">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} · ₹{order.totalAmount} · {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight size={16} className="text-border group-hover:text-acid transition-colors" />
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
