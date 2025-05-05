export const AMAZON_CONSTANTS = {
  limit: {
    product: 1000,
    reviews: 1000
  },
  reviewFilter: {
    formatType: {
      all_formats: 'all_formats',
      current_format: 'current_format'
    },
    sortBy: {
      helpful: 'helpful',
      recent: 'recent'
    },
    filterByStar: {
      positive: 'positive',
      critical: 'critical',
      five_star: 'five_star',
      four_star: 'four_star',
      three_star: 'three_star',
      two_star: 'two_star',
      one_star: 'one_star',
      all_stars: 'all_stars'
    }
  },
  defaultGeo: {
    us: {
      host: 'www.amazon.com',
      symbol: '$',
      currency: 'USD',
      price_format: (price: string): number => {
        if (!price) return 0

        const formattedPrice = price.replace(/[^\d,.]/g, '')

        if (!formattedPrice) return 0

        return parseFloat(formattedPrice.replace(/,/g, ''))
      },
      review_date: (date: string): string => {
        if (!date) return ''

        const dateRegex = /on\s(.*$)/gm
        const dateMatch = dateRegex.exec(date)

        if (!dateMatch) return ''

        return dateMatch[1]
      },
      best_seller: (text: string): { rank: number; category: string } | null => {
        if (!text) return null

        const bestSellerRegex = /#([0-9,]+)\sin\s(.*$)/gm
        const bestSellerMatch = bestSellerRegex.exec(text)

        if (!bestSellerMatch) return null

        return {
          rank: parseInt(bestSellerMatch[1].replace(/,/g, ''), 10),
          category: bestSellerMatch[2]
        }
      },
      variants: {
        split_text: 'Click to select '
      },
      product_information: {
        id: [
          '#productDetails_techSpec_section_1',
          '#productDetails_detailBullets_sections1',
          '#detailBulletsWrapper_feature_div > ul:nth-child(5)',
          '#detailBullets_feature_div > ul'
        ],
        fields: {
          Manufacturer: { key: 'manufacturer' },
          Brand: { key: 'brand' },
          Weight: { key: 'weight' },
          Dimensions: { key: 'dimensions' },
          'Item model number': { key: 'model_number' },
          Department: { key: 'department' },
          'Date First Available': { key: 'available_from' },
          'Best Sellers Rank': { key: 'rank', rank: true }
        }
      }
    }
  }
}
