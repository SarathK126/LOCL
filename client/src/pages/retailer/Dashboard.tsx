import { useQuery } from '@tanstack/react-query'
import { getRetailerOrders, getRetailerProducts, getRetailerShop } from '../../api/retailer'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Package, ShoppingBag, Store, TrendingUp, ArrowRight, AlertTriangle, Star } from 'lucide-react'
import Spinner from '../../components/Spinner'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'

export default function Dashboard() {
  const { user } = useAuth()

  const shopQ = useQuery({ queryKey: ['retailerShop'], queryFn: getRetailerShop, select: r => r.data?.data })
  const productsQ = useQuery({ queryKey: ['retailerProducts'], queryFn: getRetailerProducts, select: r => r.data?.data ?? [] })
  const ordersQ = useQuery({ queryKey: ['retailerOrders'], queryFn: getRetailerOrders, select: r => r.data?.data ?? [] })

  const revenue = ordersQ.data
    ?.filter(o => o.status === 'Delivered')
    .reduce((s, o) => s + o.totalAmount, 0) ?? 0

  const pending = ordersQ.data?.filter(o => o.status === 'Pending').length ?? 0

  const stats = [
    { label: 'Products', value: productsQ.data?.length ?? '—', icon: Package, color: 'text-blue-400' },
    { label: 'Total Orders', value: ordersQ.data?.length ?? '—', icon: ShoppingBag, color: 'text-purple-400' },
    { label: 'Pending', value: pending, icon: ShoppingBag, color: 'text-yellow-400' },
    { label: 'Revenue', value: `₹${revenue.toFixed(0)}`, icon: TrendingUp, color: 'text-acid' },
  ] as const

  // Analytics
  const lowStock = productsQ.data?.filter(p => p.stockQuantity < 5) ?? []
  
  const topSellingMap = new Map<string, {name: string, sold: number}>()
  ordersQ.data?.filter(o => o.status === 'Delivered').forEach(o => {
    o.items.forEach(item => {
      const existing = topSellingMap.get(item.productId)
      if (existing) existing.sold += item.quantity
      else topSellingMap.set(item.productId, { name: item.productName, sold: item.quantity })
    })
  })
  const topSelling = Array.from(topSellingMap.values()).sort((a, b) => b.sold - a.sold).slice(0, 3)

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <div className="mb-6">
          <p className="text-muted text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-foreground">{user?.name} <span className="text-acid">🏪</span></h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card text-center">
              <Icon size={20} className={`${color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-muted text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="card mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store size={18} className="text-acid" />
            <div>
              <p className="text-sm font-semibold text-foreground">{shopQ.data?.name ?? 'No shop yet'}</p>
              <p className="text-xs text-muted">{shopQ.data?.category ?? 'Set up your shop profile'}</p>
            </div>
          </div>
          <Link to="/retailer/shop" className="btn-ghost text-sm flex items-center gap-1">
            Manage <ArrowRight size={14} />
          </Link>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Low Stock Alerts */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-yellow-500" />
              <h2 className="text-sm font-semibold text-foreground m-0">Low Stock Alerts</h2>
            </div>
            {lowStock.length > 0 ? (
              <ul className="space-y-2">
                {lowStock.slice(0, 4).map(p => (
                  <li key={p.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-foreground truncate pr-2">{p.name}</span>
                    <span className="text-red-400 font-mono font-medium">{p.stockQuantity} left</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted">All products are well stocked.</p>
            )}
            {lowStock.length > 4 && <Link to="/retailer/inventory" className="text-xs text-acid mt-2 inline-block">View all {lowStock.length} alerts</Link>}
          </div>

          {/* Top Products */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} className="text-acid" />
              <h2 className="text-sm font-semibold text-foreground m-0">Top Selling Products</h2>
            </div>
            {topSelling.length > 0 ? (
              <ul className="space-y-2">
                {topSelling.map((p, i) => (
                  <li key={p.name} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-foreground truncate pr-2"><span className="text-muted mr-1">#{i + 1}</span> {p.name}</span>
                    <span className="text-acid font-mono font-medium">{p.sold} sold</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted">Deliver orders to see top products.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">Recent Orders</h2>
            <Link to="/retailer/orders" className="text-acid text-sm hover:underline">View all</Link>
          </div>
          {ordersQ.isLoading && <Spinner size="sm" />}
          <div className="space-y-2">
            {ordersQ.data?.slice(0, 5).map(order => (
              <div key={order.id} className="card flex items-center justify-between">
                <div>
                  <StatusBadge status={order.status} />
                  <p className="text-sm text-foreground mt-1">{order.items.length} item(s) · ₹{order.totalAmount}</p>
                  <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs font-mono text-acid border border-acid/30 bg-acid/10 px-2 py-0.5 rounded-full">
                  {order.orderType}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
