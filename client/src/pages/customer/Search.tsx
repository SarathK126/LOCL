import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchProducts } from '../../api/products'
import { Search as SearchIcon, MapPin, Package, SlidersHorizontal } from 'lucide-react'
import Spinner from '../../components/Spinner'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'
import EmptyState from '../../components/EmptyState'

const DEFAULT_LAT = 12.9352
const DEFAULT_LNG = 77.6244

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [radiusKm, setRadiusKm] = useState(5)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', query, radiusKm],
    queryFn: () => searchProducts({ query, lat: DEFAULT_LAT, lng: DEFAULT_LNG, radiusKm }),
    select: r => r.data?.data ?? [],
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearchParams({ q: query })
  }

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <h1 className="text-xl font-bold text-foreground mb-5">Product Search</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-10" placeholder="Search products…"
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
        </form>

        <div className="flex items-center gap-3 mb-6">
          <SlidersHorizontal size={14} className="text-muted" />
          <span className="text-xs text-muted">Radius:</span>
          {[2, 5, 10].map(r => (
            <button key={r} onClick={() => setRadiusKm(r)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                radiusKm === r ? 'bg-acid text-black border-acid' : 'border-border text-muted hover:border-acid/40'
              }`}>
              {r} km
            </button>
          ))}
        </div>

        {isLoading && <Spinner text="Searching nearby stores…" />}
        {isError && <p className="text-muted text-sm">Failed to search. Is the backend running?</p>}
        {data?.length === 0 && (
          <EmptyState icon={Package} title="No products found" description="Try a different query or expand the search radius" />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data?.map(product => (
            <Link key={product.id} to={`/products/${product.id}`} className="card flex flex-col gap-2 group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm group-hover:text-acid transition-colors">{product.name}</p>
                  <p className="text-muted text-xs mt-0.5 line-clamp-2">{product.description}</p>
                </div>
                <span className="text-acid font-bold text-sm ml-3">₹{product.price}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted mt-1">
                <span className="flex items-center gap-1"><MapPin size={11} />{product.distanceKm} km</span>
                <span>{product.shopName}</span>
                <span className={`ml-auto px-2 py-0.5 rounded-full border ${
                  product.isAvailable
                    ? 'border-green-500/30 text-green-400 bg-green-500/10'
                    : 'border-red-500/30 text-red-400 bg-red-500/10'
                }`}>
                  {product.isAvailable ? 'In stock' : 'Out of stock'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
