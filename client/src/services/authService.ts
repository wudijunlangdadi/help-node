import api from './api'
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error || '登录失败')
    }
    return res.data.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error || '注册失败')
    }
    return res.data.data
  },
}
