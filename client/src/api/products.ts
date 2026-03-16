import api from './axiosInstance'
import type { ApiResponse, ProductResponse, ProductSearchResult } from '../types'

interface SearchParams {
  query?: string
  lat?: number
  lng?: number
  radiusKm?: number
}

export const searchProducts = (params: SearchParams) =>
  api.get<ApiResponse<ProductSearchResult[]>>('/api/products/search', { params })

export const getProduct = (id: string) =>
  api.get<ApiResponse<ProductResponse>>(`/api/products/${id}`)
