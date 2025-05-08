# Products Finder MCP

## Overview

Products Finder MCP is a Model Context Protocol designed to help e-commerce store owners find similar products across different marketplaces:

- **AliExpress**: Search for products using images from your Shopify store
- **Amazon**: Search for products using product titles

This tool helps you discover competitor products, source new inventory, or compare pricing across different marketplaces.

## Installation

### Prerequisites

- Node.js (v22 or newer)
- npm or yarn package manager

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/cuongbuoi/products-finder-mcp.git
   cd products-finder-mcp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure your environment variables:
   Create a `.env` file with the following variables:
   ```
   KUDOSI_TOKEN=your_token
   ```
4. Build the project

   ```bash
   npm run build
   ```

5. Install bin

   ```bash
   npm i -g .
   ```

## Usage

### With Cursor IDE

1. Add the MCP to your Cursor IDE configuration:

   Open Cursor settings and add the following to your `config.json` file:

   ```json
   "mcpServers": {
     "products-finder-mcp": {
       "command": "kds-find-products-mcp",
       "env": {
         "KUDOSI_TOKEN": "your_kudosi_token"
       }
     }
   }
   ```

   Replace `/path/to/products-finder-mcp` with the actual path to the repository on your system.

2. Restart Cursor IDE.

3. Use the MCP in your workflow with commands like:
   - "Show me products from my Shopify store"
   - "Find similar products on AliExpress for this image"
   - "Search Amazon for products similar to this title"

### With Claude Desktop

To use this MCP server with Claude Desktop:

1. Follow the comprehensive guide at https://modelcontextprotocol.io/quickstart/user
2. Add your MCP server configuration in Claude Desktop settings
3. Connect Claude to your local MCP server to access shop information, products, and review management tools

## Example Queries

- "Find products in my store with low inventory"
- "Search AliExpress for products similar to my bestselling item"
- "Compare prices on Amazon for my top 5 products"
- "Find product suppliers on AliExpress for this image"

## License

MIT License

## Support

For issues or feature requests, please open an issue on the GitHub repository.
