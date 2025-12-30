/**
 * Users API - CRUD operations with page-based pagination
 */
import { BaseAPI, type ApiResponse } from '../runtime'
import type { User, UserListResponse } from '../models'

export interface GetUsersRequest {
  page?: number
  limit?: number
  status?: string
  role?: string
  search?: string
}

export interface GetUserByIdRequest {
  id: string
}

export interface CreateUserRequest {
  username: string
  email: string
  name?: string
  role?: string
}

export interface UpdateUserRequest {
  id: string
  username?: string
  email?: string
  name?: string
  role?: string
  status?: string
}

export interface DeleteUserRequest {
  id: string
}

export class UsersApi extends BaseAPI {
  /**
   * Get users list with pagination
   * @summary List all users
   */
  async getUsersRaw(requestParameters: GetUsersRequest = {}): Promise<ApiResponse<UserListResponse>> {
    const queryParams: string[] = []
    if (requestParameters.page !== undefined) {
      queryParams.push(`page=${requestParameters.page}`)
    }
    if (requestParameters.limit !== undefined) {
      queryParams.push(`limit=${requestParameters.limit}`)
    }
    if (requestParameters.status !== undefined) {
      queryParams.push(`status=${requestParameters.status}`)
    }
    if (requestParameters.role !== undefined) {
      queryParams.push(`role=${requestParameters.role}`)
    }
    if (requestParameters.search !== undefined) {
      queryParams.push(`search=${encodeURIComponent(requestParameters.search)}`)
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

    return this.request<UserListResponse>({
      url: `${this.configuration.basePath}/users${queryString}`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Get user by ID
   * @summary Get a single user
   */
  async getUserByIdRaw(requestParameters: GetUserByIdRequest): Promise<ApiResponse<User>> {
    return this.request<User>({
      url: `${this.configuration.basePath}/users/${requestParameters.id}`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Create a new user
   * @summary Create user
   */
  async createUserRaw(requestParameters: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.request<User>({
      url: `${this.configuration.basePath}/users`,
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
   * Update user
   * @summary Update user
   */
  async updateUserRaw(requestParameters: UpdateUserRequest): Promise<ApiResponse<User>> {
    const { id, ...body } = requestParameters
    return this.request<User>({
      url: `${this.configuration.basePath}/users/${id}`,
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
   * Delete user
   * @summary Delete user
   */
  async deleteUserRaw(requestParameters: DeleteUserRequest): Promise<ApiResponse<undefined>> {
    return this.request<undefined>({
      url: `${this.configuration.basePath}/users/${requestParameters.id}`,
      init: {
        method: 'DELETE',
        headers: this.configuration.headers,
      },
    })
  }
}
