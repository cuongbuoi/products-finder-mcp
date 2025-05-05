export interface ErrorResponse {
  code: string
  message: string
}

export interface Pagination {
  page_token: string
  next_page_token: string
  total_size: number
  page_size: number
}
