import request from './request'
import type { ApiResponse, SystemConfig, UpdateConfigParams } from '@/types'

export async function getConfigs(): Promise<SystemConfig[]> {
  const res = await request.get<unknown, ApiResponse<SystemConfig[]>>('/configs')
  return res.data!
}

export async function updateConfig(key: string, data: UpdateConfigParams): Promise<SystemConfig> {
  const res = await request.put<unknown, ApiResponse<SystemConfig>>(`/configs/${key}`, data)
  return res.data!
}
