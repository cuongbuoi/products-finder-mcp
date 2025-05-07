export interface SuggestProducts {
  type: string
  platform: string
  product_id: string
  product_url: string
  product_main_image_url: string
  product_title: string
  target_sale_price: string
  target_original_price: string
  avg_star: number
  sale: number
  total_review?: number
}
