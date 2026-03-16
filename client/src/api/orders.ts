import api from './axiosInstance'
import type { ApiResponse, OrderResponse, DeliveryAddressResponse } from '../types'

interface OrderItemRequest {
  productId: string
  quantity: number
}

interface CreateOrderRequest {
  shopId: string
  orderType: 'Pickup' | 'Delivery'
  items: OrderItemRequest[]
  deliveryAddress: Omit<DeliveryAddressResponse, never> | null
}

export const createOrder = (data: CreateOrderRequest) =>
  api.post<ApiResponse<OrderResponse>>('/api/orders', data)

export const getMyOrders = () =>
  api.get<ApiResponse<OrderResponse[]>>('/api/orders/my')

export const getOrder = (id: string) =>
  api.get<ApiResponse<OrderResponse>>(`/api/orders/${id}`)

export const cancelOrder = (id: string) =>
  api.patch<ApiResponse<string>>(`/api/orders/${id}/cancel`)
