export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function paginate(params: PaginationParams, total: number): PaginationResult {
  const page = Math.max(1, params.page || 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20))
  const totalPages = Math.ceil(total / pageSize)

  return {
    page,
    pageSize,
    total,
    totalPages,
  }
}
