import request from './request'
import type { ApiResponse, PushMessageParams, PushMessageResult } from '@/types'

export async function pushMessage(data: PushMessageParams): Promise<PushMessageResult> {
  const res = await request.post<unknown, ApiResponse<PushMessageResult>>('/messages', data)
  return res.data!
}
