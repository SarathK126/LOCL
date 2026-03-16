import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createOrder } from '../../api/orders'
import type { CartItem } from '../../types'
import { ShoppingBag, Trash2, MapPin } from 'lucide-react'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'
import EmptyState from '../../components/EmptyState'

interface AddressState {
  street: string
  city: string
  pinCode: string
  latitude: number
  longitude: number
}

export default function ReservationFlow() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartItem[]>(() =>
    JSON.parse(localStorage.getItem('locl_cart') ?? '[]')
  )
  const [orderType, setOrderType] = useState<'Pickup' | 'Delivery'>('Pickup')
  const [address, setAddress] = useState<AddressState>({
    street: '', city: 'Bengaluru', pinCode: '560001', latitude: 12.9352, longitude: 77.6244,
  })

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const shopId = cart[0]?.shopId

  const mutation = useMutation({
    mutationFn: () => createOrder({
      shopId,
      orderType,
      items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
      deliveryAddress: orderType === 'Delivery' ? address : null,
    }),
    onSuccess: ({ data }) => {
      if (!data.success || !data.data) { toast.error(data.message ?? 'Order failed'); return }
      localStorage.removeItem('locl_cart')
      toast.success('Order placed! 🎉')
      navigate(`/orders/${data.data.id}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Order failed')
    },
  })

  function removeItem(idx: number) {
    const updated = cart.filter((_, i) => i !== idx)
    setCart(updated)
    localStorage.setItem('locl_cart', JSON.stringify(updated))
  }

  const setAddr = (k: keyof AddressState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress(a => ({ ...a, [k]: e.target.value }))

  if (cart.length === 0) return (
    <>
      <Navbar />
      <main className="page-container">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Go back and add some products"
          action={<button onClick={() => navigate('/search')} className="btn-primary">Browse Products</button>} />
      </main>
      <BottomNav />
    </>
  )

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <h1 className="text-xl font-bold text-foreground mb-5">Checkout</h1>

        <div className="card mb-4 space-y-3">
          <h2 className="section-title mb-0">Your items</h2>
          {cart.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted">{item.shopName} · qty {item.quantity}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-acid font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                <button onClick={() => removeItem(i)} className="text-muted hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-2">
            <span className="text-muted text-sm">Total</span>
            <span className="text-foreground font-bold text-lg">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="card mb-4">
          <label className="label">Order Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['Pickup', 'Delivery'] as const).map(t => (
              <button key={t} onClick={() => setOrderType(t)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  orderType === t ? 'bg-acid text-black border-acid' : 'bg-surface border-border text-muted hover:border-acid/40'
                }`}>
                {t === 'Pickup' ? '🏪 Store Pickup' : '🛵 Delivery'}
              </button>
            ))}
          </div>
        </div>

        {orderType === 'Delivery' && (
          <div className="card mb-4 space-y-3">
            <label className="label flex items-center gap-1"><MapPin size={13} /> Delivery Address</label>
            <input className="input" placeholder="Street address" value={address.street} onChange={setAddr('street')} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" placeholder="City" value={address.city} onChange={setAddr('city')} />
              <input className="input" placeholder="PIN Code" value={address.pinCode} onChange={setAddr('pinCode')} />
            </div>
          </div>
        )}

        <button onClick={() => mutation.mutate()}
          disabled={mutation.isPending || (orderType === 'Delivery' && !address.street)}
          className="btn-primary w-full flex items-center justify-center gap-2">
          {mutation.isPending ? 'Placing order…' : `Place ${orderType} Order · ₹${total.toFixed(2)}`}
        </button>
      </main>
      <BottomNav />
    </>
  )
}
