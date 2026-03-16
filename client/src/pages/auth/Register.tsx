import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { register as registerApi } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'

type Role = 'Customer' | 'Retailer'

interface FormState {
  name: string
  email: string
  password: string
  role: Role
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', role: 'Customer' })

  const mutation = useMutation({
    mutationFn: () => registerApi(form),
    onSuccess: ({ data }) => {
      if (!data.success || !data.data) { toast.error(data.message ?? 'Registration failed'); return }
      login(data.data)
      toast.success('Account created! Welcome to LOCL.')
      navigate(data.data.role === 'Retailer' ? '/retailer' : '/home')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Registration failed')
    },
  })

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-acid/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in">
        <div className="text-center mb-8">
          <span className="font-mono font-bold text-acid text-3xl tracking-tight">LOCL</span>
          <p className="text-muted text-sm mt-2">Create your account</p>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input pl-10" placeholder="Jane Doe" value={form.name} onChange={set('name')} />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input pl-10" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input pl-10" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
            </div>
          </div>

          <div>
            <label className="label">I am a…</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Customer', 'Retailer'] as Role[]).map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.role === r
                      ? 'bg-acid text-black border-acid'
                      : 'bg-surface border-border text-muted hover:border-acid/40'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {mutation.isPending ? 'Creating account…' : 'Create account'}
            {!mutation.isPending && <ArrowRight size={16} />}
          </button>

          <p className="text-center text-sm text-muted">
            Have an account?{' '}
            <Link to="/login" className="text-acid hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
