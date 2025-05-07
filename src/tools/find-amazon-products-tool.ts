import { z } from 'zod'
import { Tool, UserError, TextContent } from 'fastmcp'
import { searchAmazonProducts } from '../services/amazon/index.js'

const parameters = z.object({
  search: z.string().describe('The search term to find Amazon products'),
  page_size: z.number().optional().default(20).describe('Maximum number of products to retrieve, default is 20')
})

export const findAmazonProductsTool: Tool<undefined, typeof parameters> = {
  name: 'kds_find_amazon_products',
  description:
    'Retrieve a list of products from Amazon with optional search filtering and pagination. This tool returns product details including titles, IDs, URLs, prices, status, review counts, and average ratings. Use this to browse your product catalog or find specific products by search term.',
  parameters,
  annotations: {
    title: 'Find Amazon Products'
  },
  timeoutMs: 60000,
  execute: async (args) => {
    try {
      const response = await searchAmazonProducts(args.search || '', args.page_size)

      const productList = response || []

      let resultText = `Retrieved ${productList.length} products${args.search ? ` matching "${args.search}"` : ''}.\n\n`

      // Add information about each product
      productList.forEach((product, index) => {
        resultText += `Product ${index + 1}: ${product.title} (ID: ${product.asin})\n`
        resultText += `Link: ${product.url}\n`
        if (index < productList.length - 1) {
          resultText += '---\n'
        }
      })

      if (productList.length === 0) {
        resultText += 'No products found.'
      }

      const result: TextContent = {
        type: 'text',
        text: resultText
      }

      return result
    } catch (error) {
      throw new UserError('Error: ' + error)
    }
  }
}
