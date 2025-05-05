import { z } from 'zod'
import { Tool, UserError, TextContent } from 'fastmcp'
import { searchAmazonProducts } from '../services/amazon/index.ts'

const findAmazonProductsToolSchema = z.object({
  search: z.string().optional(),
  page_size: z.number().optional().default(20)
})

export const findAmazonProductsTool: Tool<undefined, typeof findAmazonProductsToolSchema> = {
  name: 'kds_find_amazon_products',
  description:
    'Retrieve a list of products from Amazon with optional search filtering and pagination. This tool returns product details including titles, IDs, URLs, prices, status, review counts, and average ratings. Use this to browse your product catalog or find specific products by search term.',
  parameters: findAmazonProductsToolSchema,
  execute: async (params, { reportProgress }) => {
    try {
      reportProgress({
        progress: 0,
        total: 100
      })
      const data = await searchAmazonProducts(params.search || '', params.page_size)

      const productList = data || []

      let resultText = `Retrieved ${productList.length} products${params.search ? ` matching "${params.search}"` : ''}.\n\n`

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
    } finally {
      reportProgress({
        progress: 100,
        total: 100
      })
    }
  }
}
