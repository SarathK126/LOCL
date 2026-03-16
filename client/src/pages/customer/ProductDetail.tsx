import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProduct } from '../../api/products'
import type { CartItem } from '../../types'
import { ShoppingBag, Store, Plus, Minus } from 'lucide-react'
import Spinner from '../../components/Spinner'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id!),
    select: r => r.data?.data,
  })

  function handleAddToCart() {
    if (!product) return
    const existing: CartItem[] = JSON.parse(localStorage.getItem('locl_cart') ?? '[]')
    const idx = existing.findIndex(i => i.productId === id)
    if (idx >= 0) {
      existing[idx].quantity += qty
    } else {
      existing.push({
        productId: id!,
        shopId: product.shopId,
        name: product.name,
        price: product.price,
        shopName: product.shopName,
        quantity: qty,
      })
    }
    localStorage.setItem('locl_cart', JSON.stringify(existing))
    navigate('/checkout')
  }

  if (isLoading) return <><Navbar /><Spinner text="Loading product…" /></>

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <div className="card mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{product?.name}</h1>
              <span className="text-xs font-mono text-acid border border-acid/30 bg-acid/10 px-2 py-0.5 rounded-full">
                {product?.category}
              </span>
            </div>
            <span className="text-2xl font-bold text-acid">₹{product?.price}</span>
          </div>

          <p className="text-muted text-sm mb-4">{product?.description}</p>

          <div className="flex items-center gap-2 text-xs text-muted pb-4 border-b border-border mb-4">
            <Store size={13} className="text-acid" /> {product?.shopName}
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Stock: {product?.stockQuantity} units</span>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${
              product?.isAvailable
                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                : 'border-red-500/30 text-red-400 bg-red-500/10'
            }`}>
              {product?.isAvailable ? 'Available' : 'Out of stock'}
            </span>
          </div>
        </div>

        {product?.isAvailable && (
          <div className="card">
            <label className="label">Quantity</label>
            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center hover:border-acid/50 transition-colors">
                <Minus size={14} />
              </button>
              <span className="text-xl font-bold w-8 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}
                className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center hover:border-acid/50 transition-colors">
                <Plus size={14} />
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-muted mb-4">
              <span>Total</span>
              <span className="text-foreground font-bold text-lg">₹{(product.price * qty).toFixed(2)}</span>
            </div>

            <button onClick={handleAddToCart} className="btn-primary w-full flex items-center justify-center gap-2">
              <ShoppingBag size={16} /> Proceed to Checkout
            </button>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  )
}
