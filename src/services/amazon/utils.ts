import { SocksProxyAgent } from 'socks-proxy-agent'
import { ProxyResult } from '../../types/amazon.js'

/**
 * Generate a random user agent
 */
export const generateRandomUserAgent = (): string => {
  const os = [
    'Macintosh; Intel Mac OS X 10_15_7',
    'Macintosh; Intel Mac OS X 10_15_5',
    'Macintosh; Intel Mac OS X 10_11_6',
    'Macintosh; Intel Mac OS X 10_6_6',
    'Macintosh; Intel Mac OS X 10_9_5',
    'Macintosh; Intel Mac OS X 10_10_5',
    'Macintosh; Intel Mac OS X 10_7_5',
    'Macintosh; Intel Mac OS X 10_11_3',
    'Macintosh; Intel Mac OS X 10_10_3',
    'Macintosh; Intel Mac OS X 10_6_8',
    'Macintosh; Intel Mac OS X 10_10_2',
    'Macintosh; Intel Mac OS X 10_10_3',
    'Macintosh; Intel Mac OS X 10_11_5',
    'Windows NT 10.0; Win64; x64',
    'Windows NT 10.0; WOW64',
    'Windows NT 10.0'
  ]

  return `Mozilla/5.0 (${os[Math.floor(Math.random() * os.length)]}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${
    Math.floor(Math.random() * 4) + 100
  }.0.${Math.floor(Math.random() * 190) + 4100}.${Math.floor(Math.random() * 50) + 140} Safari/537.36`
}

/**
 * Get proxy configuration
 */
export const getProxy = (proxy: string[] | string | undefined): ProxyResult => {
  const selectProxy = Array.isArray(proxy) && proxy.length ? proxy[Math.floor(Math.random() * proxy.length)] : ''

  if (selectProxy.indexOf('socks4://') > -1 || selectProxy.indexOf('socks5://') > -1) {
    return {
      socks: true,
      proxy: new SocksProxyAgent(selectProxy)
    }
  }

  return {
    socks: false,
    proxy: selectProxy
  }
}

/**
 * Get random referer from array
 */
export const getRandomReferer = (referer: string[] | string | undefined): string => {
  if (Array.isArray(referer)) {
    return referer[Math.floor(Math.random() * referer.length)]
  }

  return ''
}

/**
 * Generate random request headers
 * @param userAgent User agent string
 * @param mainHost Main host URL
 * @param referer Referer URL
 * @param cookie Cookie string
 */
export const generateRequestHeaders = (
  userAgent: string,
  mainHost: string,
  referer: string,
  cookie: string
): Record<string, string> => {
  return {
    'user-agent': userAgent,
    cookie,
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
    ...(referer ? { referer } : {}),
    ...(Math.round(Math.random()) ? { downlink: String(Math.floor(Math.random() * 30) + 10) } : {}),
    ...(Math.round(Math.random()) ? { rtt: String(Math.floor(Math.random() * 100) + 50) } : {}),
    ...(Math.round(Math.random()) ? { pragma: 'no-cache' } : {}),
    ...(Math.round(Math.random()) ? { ect: '4g' } : {}),
    ...(Math.round(Math.random()) ? { DNT: '1' } : {}),
    'device-memory': `${Math.floor(Math.random() * 16) + 8}`,
    Referer: `${mainHost}?ref=nav_logo_${Math.floor(Math.random() * 10000000) + 1200}`,
    'viewport-width': `${Math.floor(Math.random() * 2100) + 1200}`
  }
}
