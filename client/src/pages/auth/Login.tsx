import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { login as loginApi } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  const mutation = useMutation({
    mutationFn: () => loginApi(form),
    onSuccess: ({ data }) => {
      if (!data.success || !data.data) { toast.error(data.message ?? 'Login failed'); return }
      login(data.data)
      toast.success(`Welcome back, ${data.data.name}!`)
      navigate(data.data.role === 'Retailer' ? '/retailer' : '/home')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Login failed')
    },
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-acid/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in">
        <div className="text-center mb-8">
          <span className="font-mono font-bold text-acid text-3xl tracking-tight">LOCL</span>
          <p className="text-muted text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input pl-10" type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')}
                onKeyDown={(e) => e.key === 'Enter' && mutation.mutate()} />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input pl-10" type="password" placeholder="••••••••"
                value={form.password} onChange={set('password')}
                onKeyDown={(e) => e.key === 'Enter' && mutation.mutate()} />
            </div>
          </div>

          <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
            {!mutation.isPending && <ArrowRight size={16} />}
          </button>

          <p className="text-center text-sm text-muted">
            No account?{' '}
            <Link to="/register" className="text-acid hover:underline font-medium">Register</Link>
          </p>

          <div className="mt-2 p-3 bg-surface rounded-xl border border-border text-xs text-muted space-y-1">
            <p className="font-mono text-acid/80">Demo credentials</p>
            <p>Customer: customer@locl.in / password123</p>
            <p>Retailer: retailer@locl.in / password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
