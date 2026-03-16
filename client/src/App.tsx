import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Customer
import Home from './pages/customer/Home'
import Search from './pages/customer/Search'
import StoreDetail from './pages/customer/StoreDetail'
import ProductDetail from './pages/customer/ProductDetail'
import ReservationFlow from './pages/customer/ReservationFlow'
import Orders from './pages/customer/Orders'
import OrderDetail from './pages/customer/OrderDetail'

// Retailer
import Dashboard from './pages/retailer/Dashboard'
import Inventory from './pages/retailer/Inventory'
import AddEditProduct from './pages/retailer/AddEditProduct'
import IncomingOrders from './pages/retailer/IncomingOrders'
import ShopProfile from './pages/retailer/ShopProfile'

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'Retailer' ? '/retailer' : '/home'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer */}
      <Route path="/home" element={<ProtectedRoute role="Customer"><Home /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute role="Customer"><Search /></ProtectedRoute>} />
      <Route path="/stores/:id" element={<ProtectedRoute role="Customer"><StoreDetail /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute role="Customer"><ProductDetail /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute role="Customer"><ReservationFlow /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute role="Customer"><Orders /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute role="Customer"><OrderDetail /></ProtectedRoute>} />

      {/* Retailer */}
      <Route path="/retailer" element={<ProtectedRoute role="Retailer"><Dashboard /></ProtectedRoute>} />
      <Route path="/retailer/inventory" element={<ProtectedRoute role="Retailer"><Inventory /></ProtectedRoute>} />
      <Route path="/retailer/products/new" element={<ProtectedRoute role="Retailer"><AddEditProduct /></ProtectedRoute>} />
      <Route path="/retailer/products/edit/:id" element={<ProtectedRoute role="Retailer"><AddEditProduct /></ProtectedRoute>} />
      <Route path="/retailer/orders" element={<ProtectedRoute role="Retailer"><IncomingOrders /></ProtectedRoute>} />
      <Route path="/retailer/shop" element={<ProtectedRoute role="Retailer"><ShopProfile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
