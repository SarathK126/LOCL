import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Search, Home as HomeIcon, ShoppingBag, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-mono font-bold text-acid text-lg tracking-tight">LOCL</Link>

        <div className="flex items-center gap-3">
          {user?.role === 'Customer' && (
            <>
              <Link to="/home" className="btn-ghost hidden sm:inline-flex items-center gap-1.5 text-sm">
                <HomeIcon size={15} /> Home
              </Link>
              <Link to="/search" className="btn-ghost hidden sm:inline-flex items-center gap-1.5 text-sm">
                <Search size={15} /> Search
              </Link>
              <Link to="/orders" className="btn-ghost hidden sm:inline-flex items-center gap-1.5 text-sm">
                <ShoppingBag size={15} /> Orders
              </Link>
            </>
          )}
          {user?.role === 'Retailer' && (
            <>
              <Link to="/retailer" className="btn-ghost text-sm">Dashboard</Link>
              <Link to="/retailer/inventory" className="btn-ghost text-sm">Inventory</Link>
              <Link to="/retailer/orders" className="btn-ghost text-sm">Orders</Link>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-border">
              <span className="text-xs text-muted hidden sm:block">{user.name}</span>
              <span className="text-[10px] font-mono bg-surface border border-border text-acid px-2 py-0.5 rounded-full">
                {user.role}
              </span>
              <button onClick={() => setIsDark(!isDark)} className="btn-ghost p-2 text-muted hover:text-acid" title="Toggle Theme">
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button onClick={handleLogout} className="btn-ghost p-2 text-muted hover:text-red-400">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
