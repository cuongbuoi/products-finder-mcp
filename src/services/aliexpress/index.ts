import { AxiosRequestConfig } from 'axios'
import { httpClient } from '../http-client.js'
import { ErrorResponse } from '../../types/index.js'
import { SuggestProducts } from '../../types/aliexpress.js'

interface SearchByImageRequest {
    image_url: string
    product_id: number
}

interface SearchByImageResponse {
    errors?: ErrorResponse[]
    data: SuggestProducts[]
}

export const searchByImage = async (req: SearchByImageRequest): Promise<SearchByImageResponse> => {
    return await httpClient.post<AxiosRequestConfig, SearchByImageResponse>('/importreview/search-image', req)
}
