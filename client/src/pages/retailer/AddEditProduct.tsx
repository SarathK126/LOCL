import { useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addProduct, updateProduct } from '../../api/retailer'
import type { ProductResponse } from '../../types'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import Navbar from '../../components/Navbar'

const CATEGORIES = ['Grocery', 'Pharmacy', 'Electronics', 'Bakery', 'Dairy', 'Stationery', 'Restaurant', 'Other']

interface FormState {
  name: string
  description: string
  price: string
  stockQuantity: string
  isAvailable: boolean
  category: string
}

export default function AddEditProduct() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id?: string }>()
  const qc = useQueryClient()

  const existing = (location.state as { product?: ProductResponse })?.product
  const isEdit = !!id && !!existing

  const [form, setForm] = useState<FormState>({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    price: existing?.price?.toString() ?? '',
    stockQuantity: existing?.stockQuantity?.toString() ?? '',
    isAvailable: existing?.isAvailable ?? true,
    category: existing?.category ?? 'Grocery',
  })

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity) }
      return isEdit ? updateProduct(id, payload) : addProduct(payload)
    },
    onSuccess: ({ data }) => {
      if (!data.success) { toast.error(data.message ?? 'Save failed'); return }
      toast.success(isEdit ? 'Product updated!' : 'Product added!')
      qc.invalidateQueries({ queryKey: ['retailerProducts'] })
      navigate('/retailer/inventory')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Save failed')
    },
  })

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <h1 className="text-xl font-bold text-foreground mb-5">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

        <div className="card space-y-4">
          <div>
            <label className="label">Product Name</label>
            <input className="input" placeholder="e.g. Organic Milk 500ml" value={form.name} onChange={set('name')} />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Short description…" value={form.description} onChange={set('description')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Price (₹)</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="49.00" value={form.price} onChange={set('price')} />
            </div>
            <div>
              <label className="label">Stock Qty</label>
              <input className="input" type="number" min="0" placeholder="100" value={form.stockQuantity} onChange={set('stockQuantity')} />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="avail" checked={form.isAvailable}
              onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))}
              className="w-4 h-4 accent-[#D4FF00]" />
            <label htmlFor="avail" className="text-sm text-foreground cursor-pointer">Mark as available</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name || !form.price}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Save size={15} /> {mutation.isPending ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
