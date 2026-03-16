import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRetailerShop, upsertShop } from '../../api/retailer'
import toast from 'react-hot-toast'
import { Save, MapPin } from 'lucide-react'
import Spinner from '../../components/Spinner'
import Navbar from '../../components/Navbar'

const CATEGORIES = ['Grocery', 'Pharmacy', 'Electronics', 'Bakery', 'Dairy', 'Stationery', 'Restaurant', 'Other']

interface ShopForm {
  name: string
  address: string
  latitude: number | string
  longitude: number | string
  category: string
}

export default function ShopProfile() {
  const qc = useQueryClient()

  const { data: shop, isLoading } = useQuery({
    queryKey: ['retailerShop'],
    queryFn: getRetailerShop,
    select: r => r.data?.data,
  })

  const [form, setForm] = useState<ShopForm>({
    name: '', address: '', latitude: 12.9352, longitude: 77.6244, category: 'Grocery',
  })

  useEffect(() => {
    if (shop) setForm({ name: shop.name, address: shop.address, latitude: shop.latitude, longitude: shop.longitude, category: shop.category })
  }, [shop])

  const set = (k: keyof ShopForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const mutation = useMutation({
    mutationFn: () => upsertShop({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) }),
    onSuccess: ({ data }) => {
      if (!data.success) { toast.error(data.message ?? 'Save failed'); return }
      toast.success('Shop profile saved!')
      qc.invalidateQueries({ queryKey: ['retailerShop'] })
    },
    onError: () => toast.error('Save failed'),
  })

  function useCurrentLocation() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
      () => toast.error('Location access denied')
    )
  }

  if (isLoading) return <><Navbar /><Spinner text="Loading shop…" /></>

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <h1 className="text-xl font-bold text-foreground mb-5">Shop Profile</h1>

        <div className="card space-y-4">
          <div>
            <label className="label">Shop Name</label>
            <input className="input" placeholder="My Amazing Store" value={form.name} onChange={set('name')} />
          </div>

          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Address</label>
            <input className="input" placeholder="123 Main Street, Bengaluru" value={form.address} onChange={set('address')} />
          </div>

          <div>
            <label className="label flex items-center gap-1"><MapPin size={12} className="text-acid" /> Location Coordinates</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input className="input" type="number" step="any" placeholder="Latitude" value={form.latitude} onChange={set('latitude')} />
              <input className="input" type="number" step="any" placeholder="Longitude" value={form.longitude} onChange={set('longitude')} />
            </div>
            <button type="button" onClick={useCurrentLocation} className="btn-ghost text-sm text-acid flex items-center gap-1">
              <MapPin size={13} /> Use my current location
            </button>
          </div>

          {form.latitude && form.longitude && (
            <div className="p-3 bg-surface rounded-xl border border-border text-xs text-muted">
              📍 {Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}
            </div>
          )}

          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name || !form.address}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Save size={15} /> {mutation.isPending ? 'Saving…' : 'Save Shop Profile'}
          </button>
        </div>
      </main>
    </>
  )
}
