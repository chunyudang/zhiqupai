import request from './request'
import type { ApiResponse, Level, CreateLevelParams, UpdateLevelParams } from '@/types'

export async function getLevels(categoryId?: number): Promise<Level[]> {
  const params = categoryId ? { categoryId } : {}
  const res = await request.get<unknown, ApiResponse<Level[]>>('/levels', { params })
  return res.data!
}

export async function createLevel(data: CreateLevelParams): Promise<Level> {
  const res = await request.post<unknown, ApiResponse<Level>>('/levels', data)
  return res.data!
}

export async function updateLevel(id: number, data: UpdateLevelParams): Promise<Level> {
  const res = await request.put<unknown, ApiResponse<Level>>(`/levels/${id}`, data)
  return res.data!
}

export async function deleteLevel(id: number): Promise<void> {
  await request.delete(`/levels/${id}`)
}
