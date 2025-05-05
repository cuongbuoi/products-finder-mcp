export interface AmazonGeo {
  host: string
  symbol: string
  currency: string
  price_format: (price: string) => number
  review_date: (date: string) => string
  best_seller: (text: string) => { rank: number; category: string } | null
  variants: {
    split_text: string
  }
  product_information: {
    id: string[]
    fields: Record<string, { key: string; rank?: boolean }>
  }
}

export interface AmazonReviewMetadata {
  total_reviews: number
  stars_stat: Record<number, string>
}

export interface AmazonReviewFilter {
  formatType: string
  sortBy: string
  verifiedPurchaseOnly: boolean
  filterByStar: string
}

export interface AmazonScraperOptions {
  keyword?: string
  number: number
  sponsored: boolean
  proxy?: string[] | string
  cli?: boolean
  scrapeType: 'products'
  asin?: string
  sort?: boolean
  discount?: boolean
  rating: [number, number]
  ua?: string
  timeout?: number
  randomUa?: boolean
  page?: number
  bulk?: boolean
  category?: string
  cookie?: string
  geo: AmazonGeo
  asyncTasks?: number
  reviewFilter: AmazonReviewFilter
  referer?: string[] | string
}

export interface AmazonProduct {
  position: {
    page: number
    position: number
    global_position: string
  }
  asin: string
  price: {
    discounted: boolean
    current_price: number
    currency: string
    before_price: number
    savings_amount: number
    savings_percent: number
  }
  reviews: {
    total_reviews: number
    rating: number
  }
  url: string
  score: number
  sponsored: boolean
  amazonChoice: boolean
  bestSeller: boolean
  amazonPrime: boolean
  title?: string
  thumbnail?: string
}

export interface AmazonScraperResult {
  totalProducts?: number
  category?: string
  total_reviews?: number
  stars_stat?: Record<number, string>
  result: AmazonProduct[]
}

export interface HttpRequestOptions {
  uri?: string
  method: string
  qs?: Record<string, any>
  json?: boolean
  body?: any
  form?: any
}

export interface ProxyResult {
  socks: boolean
  proxy: any
}
