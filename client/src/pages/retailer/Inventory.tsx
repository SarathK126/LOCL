import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRetailerProducts, deleteProduct, updateStock } from '../../api/retailer'
import type { ProductResponse } from '../../types'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Package } from 'lucide-react'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import Navbar from '../../components/Navbar'

export default function Inventory() {
  const qc = useQueryClient()

  const { data: products, isLoading } = useQuery({
    queryKey: ['retailerProducts'],
    queryFn: getRetailerProducts,
    select: r => r.data?.data ?? [],
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => { toast.success('Product deleted'); qc.invalidateQueries({ queryKey: ['retailerProducts'] }) },
    onError: () => toast.error('Delete failed'),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, isAvailable, stockQuantity }: Pick<ProductResponse, 'id' | 'isAvailable' | 'stockQuantity'>) =>
      updateStock(id, { isAvailable: !isAvailable, stockQuantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['retailerProducts'] }),
    onError: () => toast.error('Update failed'),
  })

  return (
    <>
      <Navbar />
      <main className="page-container animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-foreground">Inventory</h1>
          <Link to="/retailer/products/new" className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus size={15} /> Add Product
          </Link>
        </div>

        {isLoading && <Spinner text="Loading products…" />}
        {products?.length === 0 && (
          <EmptyState icon={Package} title="No products yet" description="Add your first product to start selling"
            action={<Link to="/retailer/products/new" className="btn-primary">Add Product</Link>} />
        )}

        <div className="space-y-2">
          {products?.map(p => (
            <div key={p.id} className="card flex items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{p.name}</p>
                <p className="text-xs text-muted">{p.category} · {p.stockQuantity} in stock</p>
              </div>
              <span className="text-acid font-bold text-sm">₹{p.price}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleMut.mutate({ id: p.id, isAvailable: p.isAvailable, stockQuantity: p.stockQuantity })}
                  className={`hover:opacity-80 transition-opacity ${p.isAvailable ? 'text-green-400' : 'text-muted'}`}
                  title={p.isAvailable ? 'Mark unavailable' : 'Mark available'}>
                  {p.isAvailable ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                <Link to={`/retailer/products/edit/${p.id}`} state={{ product: p }}
                  className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors">
                  <Pencil size={14} />
                </Link>
                <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteMut.mutate(p.id) }}
                  className="p-1.5 text-muted hover:text-red-400 hover:bg-surface rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
