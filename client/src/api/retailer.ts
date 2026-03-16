import api from './axiosInstance'
import type { ApiResponse, ShopResponse, ProductResponse, OrderResponse } from '../types'

interface UpsertShopRequest {
  name: string
  address: string
  latitude: number
  longitude: number
  category: string
}

interface ProductRequest {
  name: string
  description: string
  price: number
  stockQuantity: number
  isAvailable: boolean
  category: string
}

interface UpdateStockRequest {
  stockQuantity: number
  isAvailable: boolean
}

// Shop
export const getRetailerShop = () =>
  api.get<ApiResponse<ShopResponse>>('/api/retailer/shop')

export const upsertShop = (data: UpsertShopRequest) =>
  api.put<ApiResponse<ShopResponse>>('/api/retailer/shop', data)

// Products
export const getRetailerProducts = () =>
  api.get<ApiResponse<ProductResponse[]>>('/api/retailer/products')

export const addProduct = (data: ProductRequest) =>
  api.post<ApiResponse<ProductResponse>>('/api/retailer/products', data)

export const updateProduct = (id: string, data: ProductRequest) =>
  api.put<ApiResponse<ProductResponse>>(`/api/retailer/products/${id}`, data)

export const updateStock = (id: string, data: UpdateStockRequest) =>
  api.patch<ApiResponse<string>>(`/api/retailer/products/${id}/stock`, data)

export const deleteProduct = (id: string) =>
  api.delete<ApiResponse<string>>(`/api/retailer/products/${id}`)

// Orders
export const getRetailerOrders = () =>
  api.get<ApiResponse<OrderResponse[]>>('/api/retailer/orders')

export const updateOrderStatus = (id: string, status: string) =>
  api.patch<ApiResponse<string>>(`/api/retailer/orders/${id}/status`, { status })
