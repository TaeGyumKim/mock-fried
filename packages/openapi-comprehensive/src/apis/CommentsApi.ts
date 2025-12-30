/**
 * Comments API - nested resource under posts
 */
import { BaseAPI, type ApiResponse } from '../runtime'
import type { Comment } from '../models'

export interface GetPostCommentsRequest {
  postId: string
  cursor?: string
  limit?: number
}

export interface GetCommentByIdRequest {
  postId: string
  id: string
}

export interface CreateCommentRequest {
  postId: string
  content: string
  parentId?: string
}

export interface UpdateCommentRequest {
  postId: string
  id: string
  content: string
}

export interface DeleteCommentRequest {
  postId: string
  id: string
}

export interface CommentListResponse {
  comments: Comment[]
  nextCursor?: string
  prevCursor?: string
  hasMore: boolean
}

export class CommentsApi extends BaseAPI {
  /**
   * Get comments for a post with cursor pagination
   * @summary List post comments
   */
  async getPostCommentsRaw(requestParameters: GetPostCommentsRequest): Promise<ApiResponse<CommentListResponse>> {
    const queryParams: string[] = []
    if (requestParameters.cursor !== undefined) {
      queryParams.push(`cursor=${requestParameters.cursor}`)
    }
    if (requestParameters.limit !== undefined) {
      queryParams.push(`limit=${requestParameters.limit}`)
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

    return this.request<CommentListResponse>({
      url: `${this.configuration.basePath}/posts/${requestParameters.postId}/comments${queryString}`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Get comment by ID
   * @summary Get a single comment
   */
  async getCommentByIdRaw(requestParameters: GetCommentByIdRequest): Promise<ApiResponse<Comment>> {
    return this.request<Comment>({
      url: `${this.configuration.basePath}/posts/${requestParameters.postId}/comments/${requestParameters.id}`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Create a new comment
   * @summary Create comment
   */
  async createCommentRaw(requestParameters: CreateCommentRequest): Promise<ApiResponse<Comment>> {
    const { postId, ...body } = requestParameters
    return this.request<Comment>({
      url: `${this.configuration.basePath}/posts/${postId}/comments`,
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

  /**
   * Update comment
   * @summary Update comment
   */
  async updateCommentRaw(requestParameters: UpdateCommentRequest): Promise<ApiResponse<Comment>> {
    const { postId, id, ...body } = requestParameters
    return this.request<Comment>({
      url: `${this.configuration.basePath}/posts/${postId}/comments/${id}`,
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
   * Delete comment
   * @summary Delete comment
   */
  async deleteCommentRaw(requestParameters: DeleteCommentRequest): Promise<ApiResponse<undefined>> {
    return this.request<undefined>({
      url: `${this.configuration.basePath}/posts/${requestParameters.postId}/comments/${requestParameters.id}`,
      init: {
        method: 'DELETE',
        headers: this.configuration.headers,
      },
    })
  }
}
