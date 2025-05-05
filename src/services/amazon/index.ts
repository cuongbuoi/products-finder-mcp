import { AmazonScraper } from './amazon-scraper.ts'
import { AMAZON_CONSTANTS } from '../../constants/amazon.ts'
import { AmazonProduct } from '../../types/amazon.ts'
/**
 * Create an Amazon scraper with default US geo settings
 */
export const createAmazonScraper = (options: {
  keyword?: string
  asin?: string
  number?: number
  sponsored?: boolean
  sort?: boolean
  discount?: boolean
  rating?: [number, number]
  scrapeType?: 'products'
  reviewFilter?: {
    formatType?: string
    sortBy?: string
    verifiedPurchaseOnly?: boolean
    filterByStar?: string
  }
}) => {
  return new AmazonScraper({
    keyword: options.keyword,
    asin: options.asin,
    number: options.number || 10,
    sponsored: options.sponsored || false,
    sort: options.sort,
    discount: options.discount,
    rating: options.rating || [1, 5],
    scrapeType: options.scrapeType || 'products',
    geo: AMAZON_CONSTANTS.defaultGeo.us,
    reviewFilter: {
      formatType: options.reviewFilter?.formatType || 'all_formats',
      sortBy: options.reviewFilter?.sortBy || 'helpful',
      verifiedPurchaseOnly: options.reviewFilter?.verifiedPurchaseOnly || false,
      filterByStar: options.reviewFilter?.filterByStar || 'all_stars'
    }
  })
}

/**
 * Search Amazon for products based on keyword
 * @param keyword Search keyword
 * @param limit Number of results to return (default: 10)
 */
export const searchAmazonProducts = async (keyword: string, limit: number = 10): Promise<AmazonProduct[]> => {
  try {
    const scraper = createAmazonScraper({
      keyword,
      number: limit,
      scrapeType: 'products'
    })

    const results = await scraper.startScraper()
    return results.result as AmazonProduct[]
  } catch (error) {
    console.error('Error searching Amazon products:', error)
    return []
  }
}
