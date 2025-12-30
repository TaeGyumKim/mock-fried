/**
 * User list response with page-based pagination
 */
import type { User } from './User'
import { UserFromJSON, UserToJSON } from './User'
import type { PaginationMeta } from './PaginationMeta'
import { PaginationMetaFromJSON, PaginationMetaToJSON } from './PaginationMeta'

export interface UserListResponse {
  /** User items */
  items: User[]
  /** Pagination metadata */
  pagination: PaginationMeta
}

export function UserListResponseFromJSON(json: unknown): UserListResponse {
  return UserListResponseFromJSONTyped(json)
}

export function UserListResponseFromJSONTyped(json: unknown): UserListResponse {
  if (json == null) {
    return json as UserListResponse
  }
  const obj = json as Record<string, unknown>
  return {
    items: (obj['items'] as unknown[]).map(UserFromJSON),
    pagination: PaginationMetaFromJSON(obj['pagination']),
  }
}

export function UserListResponseToJSON(value: UserListResponse): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    items: value.items.map(UserToJSON),
    pagination: PaginationMetaToJSON(value.pagination),
  }
}
