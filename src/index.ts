import { createServer } from './config/server-config.js'
import dotenv from 'dotenv'

dotenv.config()

// Create and start the server
async function start(): Promise<void> {
  try {
    // Grab the transport type from the command line
    const transportType = process.argv[2] ?? 'stdio'

    // Create server instance
    const server = createServer()

    if (transportType === 'stdio') {
      server.start({ transportType })
    } else if (transportType === 'sse') {
      server.start({
        transportType,
        sse: {
          endpoint: '/sse',
          port: 3030
        }
      })
    }
  } catch (error) {
    console.error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Shutting down...')
  process.exit(0)
})

// Start the server
start()
