import request from './request'
import type { ApiResponse, PaginatedData, User, UpdateUserStatusParams } from '@/types'

export async function getUsers(page = 1, pageSize = 20, keyword?: string): Promise<PaginatedData<User>> {
  const params: Record<string, string | number> = { page, pageSize }
  if (keyword) params.keyword = keyword
  const res = await request.get<unknown, ApiResponse<PaginatedData<User>>>('/users', { params })
  return res.data!
}

export async function updateUserStatus(id: number, data: UpdateUserStatusParams): Promise<User> {
  const res = await request.put<unknown, ApiResponse<User>>(`/users/${id}/status`, data)
  return res.data!
}
