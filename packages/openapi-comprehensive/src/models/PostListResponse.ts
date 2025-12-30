/**
 * Post list response with cursor-based pagination
 */
import { exists } from '../runtime'
import type { Post } from './Post'
import { PostFromJSON, PostToJSON } from './Post'

export interface PostListResponse {
  /** Post items */
  posts: Post[]
  /** Next page cursor */
  nextCursor?: string
  /** Previous page cursor */
  prevCursor?: string
  /** Has more items */
  hasMore: boolean
}

export function PostListResponseFromJSON(json: unknown): PostListResponse {
  return PostListResponseFromJSONTyped(json)
}

export function PostListResponseFromJSONTyped(json: unknown): PostListResponse {
  if (json == null) {
    return json as PostListResponse
  }
  const obj = json as Record<string, unknown>
  return {
    posts: (obj['posts'] as unknown[]).map(PostFromJSON),
    nextCursor: exists(obj, 'next_cursor') ? obj['next_cursor'] as string : undefined,
    prevCursor: exists(obj, 'prev_cursor') ? obj['prev_cursor'] as string : undefined,
    hasMore: obj['has_more'] as boolean,
  }
}

export function PostListResponseToJSON(value: PostListResponse): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    posts: value.posts.map(PostToJSON),
    next_cursor: value.nextCursor,
    prev_cursor: value.prevCursor,
    has_more: value.hasMore,
  }
}
