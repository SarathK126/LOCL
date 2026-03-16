import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchProducts } from '../../api/products'
import { getNearbyShops } from '../../api/shops'
import { Search, MapPin, Store, ChevronRight } from 'lucide-react'
import Spinner from '../../components/Spinner'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'

const DEFAULT_LAT = 12.9352
const DEFAULT_LNG = 77.6244

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const shopsQuery = useQuery({
    queryKey: ['nearbyShops'],
    queryFn: () => getNearbyShops({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, radiusKm: 5 }),
    select: (r) => r.data?.data ?? [],
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <div className="mb-8 pt-4">
          <h1 className="text-3xl font-bold text-white mb-1">
            Find it <span className="text-acid">nearby</span>
          </h1>
          <p className="text-muted text-sm mb-6">Products from local shops within 5 km</p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input pl-10" placeholder="Search for milk, bread, electronics…"
                value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary px-6">Search</button>
          </form>
        </div>

        <div className="mb-8">
          <h2 className="section-title">Browse by category</h2>
          <div className="flex gap-2 flex-wrap">
            {['Grocery', 'Pharmacy', 'Electronics', 'Bakery', 'Dairy', 'Stationery'].map(c => (
              <button key={c} onClick={() => navigate(`/search?q=${c}`)}
                className="px-4 py-2 bg-surface border border-border rounded-full text-sm text-muted hover:border-acid/50 hover:text-white transition-all">
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="section-title flex items-center gap-2">
            <MapPin size={16} className="text-acid" /> Shops Near You
          </h2>

          {shopsQuery.isLoading && <Spinner text="Finding nearby shops…" />}
          {shopsQuery.isError && <p className="text-muted text-sm">Could not load shops. Is the backend running?</p>}
          {shopsQuery.data?.length === 0 && <p className="text-muted text-sm">No shops found within 5 km.</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shopsQuery.data?.map(shop => (
              <Link key={shop.id} to={`/stores/${shop.id}`} className="card flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center border border-border">
                    <Store size={18} className="text-acid" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{shop.name}</p>
                    <p className="text-muted text-xs">{shop.category} · {shop.distanceKm} km away</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-border group-hover:text-acid transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
