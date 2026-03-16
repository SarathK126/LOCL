import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getShop } from '../../api/shops'
import { searchProducts } from '../../api/products'
import { MapPin, Store, ChevronRight } from 'lucide-react'
import Spinner from '../../components/Spinner'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>()

  const shopQ = useQuery({
    queryKey: ['shop', id],
    queryFn: () => getShop(id!),
    select: r => r.data?.data,
  })

  const productsQ = useQuery({
    queryKey: ['shopProducts', id],
    queryFn: () => searchProducts({ lat: 12.9352, lng: 77.6244, radiusKm: 100 }),
    select: r => (r.data?.data ?? []).filter(p => p.shopId === id),
  })

  const shop = shopQ.data

  if (shopQ.isLoading) return <><Navbar /><Spinner text="Loading store…" /></>

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <div className="card mb-6 flex items-start gap-4">
          <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center border border-border flex-shrink-0">
            <Store size={24} className="text-acid" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{shop?.name}</h1>
            <p className="text-muted text-sm">{shop?.category}</p>
            <p className="text-muted text-xs mt-1 flex items-center gap-1">
              <MapPin size={12} className="text-acid" /> {shop?.address}
            </p>
            <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full border ${
              shop?.isActive ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'
            }`}>
              {shop?.isActive ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        <h2 className="section-title">Products</h2>
        {productsQ.isLoading && <Spinner text="Loading products…" />}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {productsQ.data?.map(product => (
            <Link key={product.id} to={`/products/${product.id}`} className="card flex items-start justify-between group">
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm group-hover:text-acid transition-colors">{product.name}</p>
                <p className="text-muted text-xs mt-0.5 line-clamp-1">{product.description}</p>
                <p className="text-xs mt-2 text-muted">{product.category}</p>
              </div>
              <div className="ml-4 text-right">
                <p className="text-acid font-bold">₹{product.price}</p>
                <span className={`text-xs ${product.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                  {product.isAvailable ? `${product.stockQuantity} left` : 'Out'}
                </span>
              </div>
            </Link>
          ))}
          {productsQ.data?.length === 0 && (
            <p className="text-muted text-sm col-span-2">No products listed yet.</p>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
