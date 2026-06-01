import request from './request'
import type { ApiResponse, LoginResult, Admin } from '@/types'

export async function login(username: string, password: string): Promise<LoginResult> {
  const res = await request.post<unknown, ApiResponse<LoginResult>>('/auth/login', {
    username,
    password,
  })
  return res.data!
}

export async function getProfile(): Promise<Admin> {
  const res = await request.get<unknown, ApiResponse<Admin>>('/auth/profile')
  return res.data!
}
