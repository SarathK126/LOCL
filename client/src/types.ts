// ── Shared domain types ────────────────────────────────────────────────────────

export interface User {
  userId: string
  name: string
  role: 'Customer' | 'Retailer'
}

export interface AuthResponse {
  token: string
  role: 'Customer' | 'Retailer'
  name: string
  userId: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string | null
  errors?: string[]
}

export interface ShopResponse {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  category: string
  isActive: boolean
  distanceKm: number | null
}

export interface ProductResponse {
  id: string
  shopId: string
  shopName: string
  name: string
  description: string
  price: number
  stockQuantity: number
  isAvailable: boolean
  category: string
  distanceKm: number | null
}

export interface ProductSearchResult extends ProductResponse {
  distanceKm: number
  shopAddress: string
}

export interface OrderItemResponse {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface DeliveryAddressResponse {
  street: string
  city: string
  pinCode: string
  latitude: number
  longitude: number
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Reserved'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled'

export interface OrderResponse {
  id: string
  shopId: string
  shopName: string
  status: OrderStatus
  orderType: 'Pickup' | 'Delivery'
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: OrderItemResponse[]
  deliveryAddress: DeliveryAddressResponse | null
}

// ── Cart (localStorage) ────────────────────────────────────────────────────────
export interface CartItem {
  productId: string
  shopId: string
  name: string
  price: number
  shopName: string
  quantity: number
}

// ── Auth context ───────────────────────────────────────────────────────────────
export interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (data: AuthResponse) => void
  logout: () => void
}
