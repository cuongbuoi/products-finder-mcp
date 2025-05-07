import { FastMCP } from 'fastmcp'
import { registerTools } from '../tools/index.js'

/**
 * Configuration options for the server
 */
export interface ServerConfig {
  name: string
  version: string
}

/**
 * Default server configuration
 */
export const defaultConfig: ServerConfig = {
  name: 'products-finder-mcp',
  version: '1.0.0'
}

/**
 * Create and configure the FastMCP server
 * @param config Configuration options
 * @returns Configured FastMCP server instance
 */
export function createServer(config: Partial<ServerConfig> = {}): FastMCP {
  const finalConfig = { ...defaultConfig, ...config }

  const server = new FastMCP({
    name: finalConfig.name,
    version: finalConfig.version as `${number}.${number}.${number}`
  })

  // Register all tools
  registerTools(server)

  // Add general error handling
  process.on('uncaughtException', (error) => {
    console.error(`Uncaught exception: ${error instanceof Error ? error.stack : String(error)}`)
  })

  return server
}
