/**
 * Products API - with nested variants
 */
import { BaseAPI, type ApiResponse } from '../runtime'
import type { Product } from '../models'

export interface GetProductsRequest {
  page?: number
  limit?: number
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
}

export interface GetProductByIdRequest {
  id: string
}

export interface CreateProductRequest {
  name: string
  description: string
  category: string
  price: number
  sku: string
  stock: number
  imageUrl: string
}

export interface UpdateProductRequest {
  id: string
  name?: string
  description?: string
  category?: string
  price?: number
  stock?: number
}

export interface DeleteProductRequest {
  id: string
}

export interface ProductListResponse {
  items: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class ProductsApi extends BaseAPI {
  /**
   * Get products list with pagination
   * @summary List all products
   */
  async getProductsRaw(requestParameters: GetProductsRequest = {}): Promise<ApiResponse<ProductListResponse>> {
    const queryParams: string[] = []
    if (requestParameters.page !== undefined) {
      queryParams.push(`page=${requestParameters.page}`)
    }
    if (requestParameters.limit !== undefined) {
      queryParams.push(`limit=${requestParameters.limit}`)
    }
    if (requestParameters.category !== undefined) {
      queryParams.push(`category=${requestParameters.category}`)
    }
    if (requestParameters.minPrice !== undefined) {
      queryParams.push(`min_price=${requestParameters.minPrice}`)
    }
    if (requestParameters.maxPrice !== undefined) {
      queryParams.push(`max_price=${requestParameters.maxPrice}`)
    }
    if (requestParameters.inStock !== undefined) {
      queryParams.push(`in_stock=${requestParameters.inStock}`)
    }
    if (requestParameters.search !== undefined) {
      queryParams.push(`search=${encodeURIComponent(requestParameters.search)}`)
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

    return this.request<ProductListResponse>({
      url: `${this.configuration.basePath}/products${queryString}`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Get product by ID
   * @summary Get a single product
   */
  async getProductByIdRaw(requestParameters: GetProductByIdRequest): Promise<ApiResponse<Product>> {
    return this.request<Product>({
      url: `${this.configuration.basePath}/products/${requestParameters.id}`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Create a new product
   * @summary Create product
   */
  async createProductRaw(requestParameters: CreateProductRequest): Promise<ApiResponse<Product>> {
    return this.request<Product>({
      url: `${this.configuration.basePath}/products`,
      init: {
        method: 'POST',
        headers: {
          ...this.configuration.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestParameters),
      },
    })
  }

  /**
   * Update product
   * @summary Update product
   */
  async updateProductRaw(requestParameters: UpdateProductRequest): Promise<ApiResponse<Product>> {
    const { id, ...body } = requestParameters
    return this.request<Product>({
      url: `${this.configuration.basePath}/products/${id}`,
      init: {
        method: 'PUT',
        headers: {
          ...this.configuration.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    })
  }

  /**
   * Delete product
   * @summary Delete product
   */
  async deleteProductRaw(requestParameters: DeleteProductRequest): Promise<ApiResponse<undefined>> {
    return this.request<undefined>({
      url: `${this.configuration.basePath}/products/${requestParameters.id}`,
      init: {
        method: 'DELETE',
        headers: this.configuration.headers,
      },
    })
  }
}
