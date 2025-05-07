import { AxiosRequestConfig } from 'axios'
import { httpClient } from '../http-client.ts'
import { ErrorResponse } from '../../types/index.ts'
import { SuggestProducts } from '../../types/aliexpress.ts'

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
