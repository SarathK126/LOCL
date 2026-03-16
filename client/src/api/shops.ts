import api from './axiosInstance'
import type { ApiResponse, ShopResponse } from '../types'

interface NearbyParams {
  lat?: number
  lng?: number
  radiusKm?: number
}

export const getNearbyShops = (params: NearbyParams) =>
  api.get<ApiResponse<ShopResponse[]>>('/api/shops/nearby', { params })

export const getShop = (id: string) =>
  api.get<ApiResponse<ShopResponse>>(`/api/shops/${id}`)
