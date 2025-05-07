import { FastMCP } from 'fastmcp'
import { findAmazonProductsTool } from './find-amazon-products-tool.js'
import { searchAliexpressByImageTool } from './search-aliexpress-by-image.js'

/**
 * Register all tools with the FastMCP server
 * @param server The FastMCP server instance
 */
export function registerTools(server: FastMCP): void {
  server.addTool(findAmazonProductsTool)
  server.addTool(searchAliexpressByImageTool)
}
