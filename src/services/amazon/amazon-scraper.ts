import { forEachLimit } from 'async'
import * as cheerio from 'cheerio'
import ora from 'ora'
import * as moment from 'moment'
import axios, { AxiosRequestConfig } from 'axios'
import { SocksProxyAgent } from 'socks-proxy-agent'

import {
  AmazonGeo,
  AmazonScraperOptions,
  AmazonProduct,
  AmazonReviewMetadata,
  HttpRequestOptions,
  AmazonScraperResult
} from '../../types/amazon.ts'
import { generateRandomUserAgent, getProxy, getRandomReferer, generateRequestHeaders } from './utils.ts'

/**
 * Amazon Scraper
 * Scrape products, reviews, and product details from Amazon
 */
export class AmazonScraper {
  private asyncTasks: number
  private asyncPage: number = 1
  private mainHost: string
  private geo: AmazonGeo
  private cookie: string
  private bulk: boolean
  private productSearchCategory?: string
  private collector: AmazonProduct[] = []
  private keyword?: string
  private number: number
  private searchPage?: number
  private proxy?: string[] | string
  private cli?: boolean
  private scrapeType: 'products'
  private rating: [number, number]
  private timeout: number
  private randomUa: boolean
  private totalProducts: number = 0
  private referer?: string[] | string
  private ua: string
  private spinner?: ReturnType<typeof ora>

  /**
   * Create a new AmazonScraper
   * @param options Scraper options
   */
  constructor(options: AmazonScraperOptions) {
    // Validate input options
    if (!options.scrapeType) {
      throw new Error('You must specify a scrape type (products, reviews, asin)')
    }

    if (options.scrapeType === 'products' && !options.keyword && !options.category) {
      throw new Error('Keyword or category is required for product search')
    }

    // Initialize class properties
    this.asyncTasks = options.asyncTasks || 5
    this.mainHost = `https://${options.geo.host}`
    this.geo = options.geo
    this.cookie = options.cookie || ''
    this.bulk = options.bulk || false
    this.productSearchCategory = options.category
    this.keyword = options.keyword
    this.number = options.number > 0 ? options.number : 10
    this.searchPage = options.page
    this.proxy = options.proxy
    this.cli = options.cli
    this.scrapeType = options.scrapeType
    this.rating = options.rating || [1, 5]
    this.timeout = options.timeout || 500
    this.randomUa = options.randomUa || false
    this.referer = options.referer
    this.ua =
      options.ua ||
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'

    // Initialize CLI spinner if enabled
    if (this.cli) {
      this.spinner = ora('Amazon Scraper is starting...').start()
    }
  }

  /**
   * Get user agent
   * If randomUa then user agent version will be randomized, this helps to prevent request blocking from the amazon side
   */
  get userAgent(): string {
    return this.randomUa ? generateRandomUserAgent() : this.ua
  }

  /**
   * Get referer method
   */
  get getReferer(): string {
    return getRandomReferer(this.referer)
  }

  /**
   * Main request method
   */
  private async httpRequest({ uri, method, qs, json, body, form }: HttpRequestOptions): Promise<any> {
    const proxy = getProxy(this.proxy)
    const url = uri ? `${this.mainHost}/${uri}` : this.mainHost

    // Build query string from qs object
    const queryParams = new URLSearchParams()
    if (qs) {
      Object.entries(qs).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const fullUrl = `${url}${queryString}`

    // Configure axios request
    const axiosConfig: AxiosRequestConfig = {
      method: method || 'GET',
      url: fullUrl,
      headers: generateRequestHeaders(this.userAgent, this.mainHost, this.getReferer, this.cookie),
      responseType: json ? 'json' : 'text',
      timeout: this.timeout,
      decompress: true,
      maxRedirects: 5,
      data: body || form
    }

    // Add proxy configuration if needed
    if (proxy.proxy) {
      if (proxy.socks) {
        const socksAgent = new SocksProxyAgent(`socks://${proxy.proxy}`)
        axiosConfig.httpsAgent = socksAgent
        axiosConfig.httpAgent = socksAgent
      } else {
        axiosConfig.proxy = {
          host: proxy.proxy.split(':')[0],
          port: parseInt(proxy.proxy.split(':')[1], 10)
        }
      }
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const response = await axios(axiosConfig)
          resolve({
            body: response.data,
            statusCode: response.status,
            headers: response.headers
          })
        } catch (error) {
          reject(error)
        }
      }, this.timeout)
    })
  }

  /**
   * Start scraper
   */
  public async startScraper(): Promise<AmazonScraperResult> {
    // Start scraping timer
    const startTime = Date.now()

    // Validate input parameters
    if (this.scrapeType === 'products' && !this.keyword && !this.productSearchCategory) {
      throw new Error('Keyword or category is required for product search')
    }

    if (this.number > 1000) {
      throw new Error('Maximum number of items to retrieve is 1000')
    }

    // Update CLI spinner if enabled
    if (this.cli && this.spinner) {
      this.spinner.text = `Starting ${this.scrapeType} search...`
    }

    try {
      // Execute main scraping logic
      await this.mainLoop()

      // Stop CLI spinner if enabled
      if (this.cli && this.spinner) {
        this.spinner.succeed(
          `Scraping completed in ${moment.duration(Date.now() - startTime).humanize()}, ${this.collector.length
          } items collected`
        )
      }

      return {
        totalProducts: this.totalProducts,
        category: this.productSearchCategory,
        result: this.collector as AmazonProduct[]
      }
    } catch (error) {
      // Handle errors
      if (this.cli && this.spinner) {
        this.spinner.fail(`Scraping failed: ${(error as Error).message}`)
      }
      throw error
    }
  }

  /**
   * Main loop that collects data
   */
  private async mainLoop(): Promise<void> {
    return new Promise((resolve, reject) => {
      forEachLimit(
        Array.from({ length: this.asyncPage }, (_, k) => k + 1),
        this.asyncTasks,
        async (item) => {
          const body = await this.buildRequest(this.bulk ? item : this.searchPage)

          if (this.scrapeType === 'products') {
            const totalResultCount = body.match(/"totalResultCount":\w+(.[0-9])/gm)

            if (totalResultCount) {
              this.totalProducts = parseInt(totalResultCount[0].split('totalResultCount":')[1], 10)
            }

            this.grabProduct(body, item)
          }

          if (!this.bulk) {
            throw new Error('Done')
          }
        },
        (err) => {
          if (err && err.message !== 'Done') reject(err)
          resolve()
        }
      )
    })
  }

  /**
   * Get request endpoint based on scrape type
   */
  private get setRequestEndpoint(): string {
    switch (this.scrapeType) {
      case 'products':
        return 's'
      default:
        return ''
    }
  }

  /**
   * Create request
   */
  private async buildRequest(page?: number): Promise<string> {
    const options: HttpRequestOptions = {
      method: 'GET',
      uri: this.setRequestEndpoint,
      qs: {
        ...(this.scrapeType === 'products'
          ? {
            k: this.keyword,
            ...(this.productSearchCategory ? { i: this.productSearchCategory } : {}),
            ...(page && page > 1 ? { page, ref: `sr_pg_${page}` } : {})
          }
          : {})
      }
    }
    try {
      const response = await this.httpRequest(options)
      return response.body
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  /**
   * Collect products from html response
   */
  private grabProduct(body: string, page: number): void {
    const $ = cheerio.load(body.replace(/\s\s+/g, '').replace(/\n/g, ''))
    const productList = $('div[data-index]')
    const scrapingResult: Record<string, AmazonProduct> = {}

    let position = 0
    for (let i = 0; i < productList.length; i++) {
      if (this.cli && this.spinner) {
        this.spinner.text = `Found ${this.collector.length + productList.length} products`
      }

      const element = productList[i]
      const asin = $(element).attr('data-asin')

      if (!asin) {
        continue
      }

      position += 1
      scrapingResult[asin] = {
        position: {
          page,
          position,
          global_position: `${page}${i}`
        },
        asin,
        price: {
          discounted: false,
          current_price: 0,
          currency: this.geo.currency,
          before_price: 0,
          savings_amount: 0,
          savings_percent: 0
        },
        reviews: {
          total_reviews: 0,
          rating: 0
        },
        url: `${this.mainHost}/dp/${asin}`,
        score: 0,
        sponsored: false,
        amazonChoice: false,
        bestSeller: false,
        amazonPrime: false
      }
    }

    for (const key in scrapingResult) {
      try {
        const priceSearch =
          $(`div[data-asin=${key}] span[data-a-size="xl"]`).first().get(0) ||
          $(`div[data-asin=${key}] span[data-a-size="l"]`).first().get(0) ||
          $(`div[data-asin=${key}] span[data-a-size="m"]`).first().get(0)
        const discountSearch = $(`div[data-asin=${key}] span[data-a-strike="true"]`).first().get(0)
        const ratingSearch = $(`div[data-asin=${key}] .a-icon-star-small`).first().get(0)
        const titleThumbnailSearch = $(`div[data-asin=${key}] [data-image-source-density="1"]`).first().get(0)
        const amazonChoice = $(`div[data-asin=${key}] span[id="${key}-amazons-choice"]`).text()
        const bestSeller = $(`div[data-asin=${key}] span[id="${key}-best-seller"]`).text()
        const amazonPrime = $(`div[data-asin=${key}] .s-prime`).first().get(0)

        if (priceSearch) {
          const priceText = $(priceSearch).find(':first-child').text()
          scrapingResult[key].price.current_price = this.geo.price_format(priceText)
        }

        if (amazonChoice) {
          scrapingResult[key].amazonChoice = true
        }

        if (bestSeller) {
          scrapingResult[key].bestSeller = true
        }

        if (amazonPrime) {
          scrapingResult[key].amazonPrime = true
        }

        if (discountSearch) {
          const beforePriceText = $(discountSearch).find(':first-child').text()
          scrapingResult[key].price.before_price = this.geo.price_format(beforePriceText)

          scrapingResult[key].price.discounted = true

          const savings = scrapingResult[key].price.before_price - scrapingResult[key].price.current_price
          if (savings <= 0) {
            scrapingResult[key].price.discounted = false
            scrapingResult[key].price.before_price = 0
          } else {
            scrapingResult[key].price.savings_amount = +(
              scrapingResult[key].price.before_price - scrapingResult[key].price.current_price
            ).toFixed(2)

            scrapingResult[key].price.savings_percent = +(
              (100 / scrapingResult[key].price.before_price) *
              scrapingResult[key].price.savings_amount
            ).toFixed(2)
          }
        }

        if (ratingSearch) {
          const ratingText = $(ratingSearch).find(':first-child').find(':first-child').text()
          if (ratingText) {
            scrapingResult[key].reviews.rating = parseFloat(ratingText)
          }

          const parentElement = $(ratingSearch).parent().parent().parent()
          const nextElement = parentElement.next()
          const totalReviews = nextElement.attr('aria-label')

          if (totalReviews) {
            scrapingResult[key].reviews.total_reviews = parseInt(totalReviews.replace(/,/g, ''), 10)
          }

          scrapingResult[key].score = parseFloat(
            (scrapingResult[key].reviews.rating * scrapingResult[key].reviews.total_reviews).toFixed(2)
          )
        }

        if (titleThumbnailSearch) {
          scrapingResult[key].title = $(titleThumbnailSearch).attr('alt') || ''
          scrapingResult[key].thumbnail = $(titleThumbnailSearch).attr('src') || ''
        }
      } catch {
        continue
      }
    }

    for (const key in scrapingResult) {
      this.collector.push(scrapingResult[key])
    }

    if (productList.length < 10) {
      throw new Error('No more products')
    }
  }
}
