import api from './axiosInstance'
import type { ApiResponse, AuthResponse } from '../types'

interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'Customer' | 'Retailer'
}

interface LoginRequest {
  email: string
  password: string
}

export const register = (data: RegisterRequest) =>
  api.post<ApiResponse<AuthResponse>>('/api/auth/register', data)

export const login = (data: LoginRequest) =>
  api.post<ApiResponse<AuthResponse>>('/api/auth/login', data)
