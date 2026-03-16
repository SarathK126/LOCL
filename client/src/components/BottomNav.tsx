import { NavLink } from 'react-router-dom'
import { Home, Search, ShoppingBag } from 'lucide-react'

export default function BottomNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
      isActive ? 'text-acid' : 'text-muted hover:text-foreground'
    }`

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border flex">
      <NavLink to="/home" end className={linkClass} style={{ flex: 1, padding: '10px 0' }}>
        <Home size={20} />
        Home
      </NavLink>
      <NavLink to="/search" className={linkClass} style={{ flex: 1, padding: '10px 0' }}>
        <Search size={20} />
        Search
      </NavLink>
      <NavLink to="/orders" className={linkClass} style={{ flex: 1, padding: '10px 0' }}>
        <ShoppingBag size={20} />
        Orders
      </NavLink>
    </nav>
  )
}
