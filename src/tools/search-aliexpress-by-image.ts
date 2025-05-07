import { z } from 'zod'
import { Tool, UserError, TextContent } from 'fastmcp'
import { searchByImage } from '../services/aliexpress/index.js'
const parameters = z.object({
    image_url: z.string().describe("The image URL of the product"),
    product_id: z.number().describe("The Shopify product ID of the product")
})

export const searchAliexpressByImageTool: Tool<undefined, typeof parameters> = {
    name: 'kds_search_aliexpress_products_by_image',
    description: 'Retrieve a list of products from AliExpress by product image. This tool returns product details including titles, IDs, URLs, prices, status, review counts, and average ratings. Use this to browse your product catalog or find specific products by image.',
    parameters,
    annotations: {
        'title': 'Search AliExpress by product image',
    },
    timeoutMs: 60000,
    execute: async (args) => {
        try {
            const response = await searchByImage(args)
            const productList = response.data || []

            let resultText = `Retrieved ${productList.length} products${args.image_url ? ` matching "${args.image_url}"` : ''}.\n\n`

            // Add information about each product
            productList.forEach((product, index) => {
                resultText += `Product ${index + 1}: ${product.product_title} (ID: ${product.product_id})\n`
                resultText += `Link: ${product.product_url}\n`
                resultText += `Image: ${product.product_main_image_url}\n`
                resultText += `Rating: ${product.avg_star}\n`
                resultText += `Sales: ${product.sale}\n`
                resultText += `Reviews: ${product.total_review}\n`
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