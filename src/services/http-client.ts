// HTTP client for making requests to the API
import axios, { AxiosResponse } from 'axios'
import dotenv from 'dotenv'

dotenv.config()

export const httpClient = axios.create({
  baseURL: process.env.KUDOSI_API_URL || 'https://priv.kudosi.ai',
  headers: {
    'Content-Type': 'application/json',
    Accept: '*/*',
    Authorization: `Bearer ${process.env.KUDOSI_TOKEN}`
  }
})

httpClient.interceptors.request.use((config) => {
  return config
})

httpClient.interceptors.response.use(
  (response) => {
    switch (response.status) {
      case 200:
        return response.data
      case 401:
        throw new Error('Unauthorized')
      default:
        return Promise.reject(response.data)
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const get = async <P, T>(url: string, params?: P): Promise<AxiosResponse<T>> => {
  const response = await httpClient.get(url, { params })
  return response.data
}

export const post = async <T, D>(url: string, data: D): Promise<T> => {
  const response = await httpClient.post(url, data)
  return response.data
}

export const put = async <T, D>(url: string, data: D): Promise<T> => {
  const response = await httpClient.put(url, data)
  return response.data
}

export const del = async <T>(url: string): Promise<T> => {
  const response = await httpClient.delete(url)
  return response.data
}
