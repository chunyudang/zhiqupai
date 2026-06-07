import request from './request'
import type {
  ApiResponse,
  PaginatedData,
  ShopGood,
  ShopOrder,
  CreateGoodsParams,
  UpdateGoodsParams,
  QueryGoodsParams,
  QueryOrdersParams,
  ImportCodesParams,
  ShopDashboardStats,
} from '@/types'

export async function getShopGoods(params: QueryGoodsParams = {}): Promise<PaginatedData<ShopGood>> {
  const res = await request.get<unknown, ApiResponse<PaginatedData<ShopGood>>>('/shop/goods', { params })
  return res.data!
}

export async function createGoods(data: CreateGoodsParams): Promise<ShopGood> {
  const res = await request.post<unknown, ApiResponse<ShopGood>>('/shop/goods', data)
  return res.data!
}

export async function updateGoods(id: number, data: UpdateGoodsParams): Promise<ShopGood> {
  const res = await request.put<unknown, ApiResponse<ShopGood>>(`/shop/goods/${id}`, data)
  return res.data!
}

export async function deleteGoods(id: number): Promise<void> {
  await request.delete(`/shop/goods/${id}`)
}

export async function importGoodsCodes(id: number, data: ImportCodesParams): Promise<{ importedCount: number }> {
  const res = await request.post<unknown, ApiResponse<{ importedCount: number }>>(`/shop/goods/${id}/codes`, data)
  return res.data!
}

export async function getShopOrders(params: QueryOrdersParams = {}): Promise<PaginatedData<ShopOrder>> {
  const res = await request.get<unknown, ApiResponse<PaginatedData<ShopOrder>>>('/shop/orders', { params })
  return res.data!
}

export async function getShopDashboard(): Promise<ShopDashboardStats> {
  const res = await request.get<unknown, ApiResponse<ShopDashboardStats>>('/shop/dashboard')
  return res.data!
}
