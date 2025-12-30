/**
 * Posts API - CRUD operations with cursor-based pagination
 */
import { BaseAPI, type ApiResponse } from '../runtime'
import type { Post, PostListResponse } from '../models'

export interface GetPostsRequest {
  cursor?: string
  limit?: number
  authorId?: string
  isPublished?: boolean
  tag?: string
}

export interface GetPostByIdRequest {
  id: string
}

export interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  tags?: string[]
  isPublished?: boolean
}

export interface UpdatePostRequest {
  id: string
  title?: string
  content?: string
  excerpt?: string
  tags?: string[]
  isPublished?: boolean
}

export interface DeletePostRequest {
  id: string
}

export class PostsApi extends BaseAPI {
  /**
   * Get posts list with cursor pagination
   * @summary List all posts
   */
  async getPostsRaw(requestParameters: GetPostsRequest = {}): Promise<ApiResponse<PostListResponse>> {
    const queryParams: string[] = []
    if (requestParameters.cursor !== undefined) {
      queryParams.push(`cursor=${requestParameters.cursor}`)
    }
    if (requestParameters.limit !== undefined) {
      queryParams.push(`limit=${requestParameters.limit}`)
    }
    if (requestParameters.authorId !== undefined) {
      queryParams.push(`author_id=${requestParameters.authorId}`)
    }
    if (requestParameters.isPublished !== undefined) {
      queryParams.push(`is_published=${requestParameters.isPublished}`)
    }
    if (requestParameters.tag !== undefined) {
      queryParams.push(`tag=${encodeURIComponent(requestParameters.tag)}`)
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

    return this.request<PostListResponse>({
      url: `${this.configuration.basePath}/posts${queryString}`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Get post by ID
   * @summary Get a single post
   */
  async getPostByIdRaw(requestParameters: GetPostByIdRequest): Promise<ApiResponse<Post>> {
    return this.request<Post>({
      url: `${this.configuration.basePath}/posts/${requestParameters.id}`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Create a new post
   * @summary Create post
   */
  async createPostRaw(requestParameters: CreatePostRequest): Promise<ApiResponse<Post>> {
    return this.request<Post>({
      url: `${this.configuration.basePath}/posts`,
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
   * Update post
   * @summary Update post
   */
  async updatePostRaw(requestParameters: UpdatePostRequest): Promise<ApiResponse<Post>> {
    const { id, ...body } = requestParameters
    return this.request<Post>({
      url: `${this.configuration.basePath}/posts/${id}`,
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
   * Delete post
   * @summary Delete post
   */
  async deletePostRaw(requestParameters: DeletePostRequest): Promise<ApiResponse<undefined>> {
    return this.request<undefined>({
      url: `${this.configuration.basePath}/posts/${requestParameters.id}`,
      init: {
        method: 'DELETE',
        headers: this.configuration.headers,
      },
    })
  }
}
