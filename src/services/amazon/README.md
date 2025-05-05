# Amazon Scraper

A TypeScript implementation of an Amazon scraper for extracting products, reviews, and product details from Amazon.

## Features

- Search for products using keywords
- Get detailed information about a product using ASIN
- Get reviews for a product
- Filter reviews by rating, verified purchase, etc.
- Sort results by different criteria
- Export results to JSON or CSV

## Installation

This module is part of the project and requires the following dependencies:

```bash
npm install request-promise async cheerio ora json2csv moment bluebird socks-proxy-agent
npm install @types/request-promise @types/async @types/cheerio @types/json2csv @types/bluebird --save-dev
```

## Usage

### Basic Usage

```typescript
import { createAmazonScraper, AmazonScraper } from './services/amazon'

// Search for products
const productScraper = createAmazonScraper({
  keyword: 'laptop',
  number: 10,
  scrapeType: 'products'
})

const productResults = await productScraper.startScraper()
console.log(productResults.result)

// Get product details
const asinScraper = createAmazonScraper({
  asin: 'B07NJPXFKR',
  scrapeType: 'asin'
})

const asinResults = await asinScraper.startScraper()
console.log(asinResults.result[0])

// Get product reviews
const reviewScraper = createAmazonScraper({
  asin: 'B07NJPXFKR',
  number: 20,
  scrapeType: 'reviews',
  reviewFilter: {
    formatType: 'all_formats',
    sortBy: 'helpful',
    verifiedPurchaseOnly: true,
    filterByStar: 'all_stars'
  }
})

const reviewResults = await reviewScraper.startScraper()
console.log(reviewResults.result)
```

### Using Helper Functions

```typescript
import { searchAmazonProducts, getAmazonProductDetails, getAmazonProductReviews } from './tools/amazon-lookup'

// Search for products
const products = await searchAmazonProducts('laptop', 10)
console.log(products)

// Get product details
const productDetails = await getAmazonProductDetails('B07NJPXFKR')
console.log(productDetails)

// Get product reviews
const reviews = await getAmazonProductReviews('B07NJPXFKR', 20)
console.log(reviews.result)
```

## Advanced Configuration

### Full Options

```typescript
const scraper = new AmazonScraper({
  keyword: 'laptop', // Required for product search
  asin: 'B07NJPXFKR', // Required for reviews and product details
  number: 10, // Number of results to get
  sponsored: false, // Include sponsored results
  sort: true, // Sort results by score
  discount: false, // Filter for discounted products only
  rating: [3, 5], // Min and max rating filter
  scrapeType: 'products', // 'products', 'reviews', or 'asin'
  geo: AMAZON_CONSTANTS.defaultGeo.us, // Geographic settings
  reviewFilter: {
    formatType: 'all_formats',
    sortBy: 'helpful',
    verifiedPurchaseOnly: false,
    filterByStar: 'all_stars'
  },
  // Optional parameters
  proxy: ['http://proxy1.com', 'http://proxy2.com'], // Proxies to use
  cli: false, // Show CLI spinner
  filetype: 'json', // Save results to file ('json', 'csv', 'all')
  timeout: 500, // Request timeout
  randomUa: true, // Use random user agent
  bulk: false, // Bulk scraping mode
  page: 1, // Search page to start from
  cookie: '', // Custom cookie
  referer: ['https://www.google.com'] // Custom referer(s)
})
```

## Note

This scraper is for educational purposes only. Please use responsibly and follow Amazon's terms of service.
