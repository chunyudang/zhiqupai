import request from './request'
import type { ApiResponse, Category, CreateCategoryParams, UpdateCategoryParams } from '@/types'

export async function getCategories(): Promise<Category[]> {
  const res = await request.get<unknown, ApiResponse<Category[]>>('/categories')
  return res.data!
}

export async function createCategory(data: CreateCategoryParams): Promise<Category> {
  const res = await request.post<unknown, ApiResponse<Category>>('/categories', data)
  return res.data!
}

export async function updateCategory(id: number, data: UpdateCategoryParams): Promise<Category> {
  const res = await request.put<unknown, ApiResponse<Category>>(`/categories/${id}`, data)
  return res.data!
}

export async function deleteCategory(id: number): Promise<void> {
  await request.delete(`/categories/${id}`)
}
