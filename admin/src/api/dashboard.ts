import request from './request'
import type { ApiResponse, DashboardStats } from '@/types'

export async function getDashboard(): Promise<DashboardStats> {
  const res = await request.get<unknown, ApiResponse<DashboardStats>>('/dashboard')
  return res.data!
}
