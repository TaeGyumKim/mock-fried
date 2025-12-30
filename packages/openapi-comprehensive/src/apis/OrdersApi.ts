/**
 * Orders API - complex nested data
 */
import { BaseAPI, type ApiResponse } from '../runtime'
import type { Order } from '../models'

export interface GetOrdersRequest {
  page?: number
  limit?: number
  userId?: string
  status?: string
  fromDate?: string
  toDate?: string
}

export interface GetOrderByIdRequest {
  id: string
}

export interface CreateOrderRequest {
  userId: string
  items: Array<{
    productId: string
    quantity: number
  }>
  shippingAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
}

export interface UpdateOrderStatusRequest {
  id: string
  status: string
}

export interface CancelOrderRequest {
  id: string
  reason?: string
}

export interface OrderListResponse {
  items: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class OrdersApi extends BaseAPI {
  /**
   * Get orders list with pagination
   * @summary List all orders
   */
  async getOrdersRaw(requestParameters: GetOrdersRequest = {}): Promise<ApiResponse<OrderListResponse>> {
    const queryParams: string[] = []
    if (requestParameters.page !== undefined) {
      queryParams.push(`page=${requestParameters.page}`)
    }
    if (requestParameters.limit !== undefined) {
      queryParams.push(`limit=${requestParameters.limit}`)
    }
    if (requestParameters.userId !== undefined) {
      queryParams.push(`user_id=${requestParameters.userId}`)
    }
    if (requestParameters.status !== undefined) {
      queryParams.push(`status=${requestParameters.status}`)
    }
    if (requestParameters.fromDate !== undefined) {
      queryParams.push(`from_date=${requestParameters.fromDate}`)
    }
    if (requestParameters.toDate !== undefined) {
      queryParams.push(`to_date=${requestParameters.toDate}`)
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

    return this.request<OrderListResponse>({
      url: `${this.configuration.basePath}/orders${queryString}`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Get order by ID
   * @summary Get a single order
   */
  async getOrderByIdRaw(requestParameters: GetOrderByIdRequest): Promise<ApiResponse<Order>> {
    return this.request<Order>({
      url: `${this.configuration.basePath}/orders/${requestParameters.id}`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Create a new order
   * @summary Create order
   */
  async createOrderRaw(requestParameters: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return this.request<Order>({
      url: `${this.configuration.basePath}/orders`,
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
   * Update order status
   * @summary Update order status
   */
  async updateOrderStatusRaw(requestParameters: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
    const { id, ...body } = requestParameters
    return this.request<Order>({
      url: `${this.configuration.basePath}/orders/${id}/status`,
      init: {
        method: 'PATCH',
        headers: {
          ...this.configuration.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    })
  }

  /**
   * Cancel order
   * @summary Cancel order
   */
  async cancelOrderRaw(requestParameters: CancelOrderRequest): Promise<ApiResponse<Order>> {
    const { id, ...body } = requestParameters
    return this.request<Order>({
      url: `${this.configuration.basePath}/orders/${id}/cancel`,
      init: {
        method: 'POST',
        headers: {
          ...this.configuration.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    })
  }
}
