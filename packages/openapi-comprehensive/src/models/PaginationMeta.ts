/**
 * Page-based pagination metadata
 */

export interface PaginationMeta {
  /** Current page (1-based) */
  page: number
  /** Items per page */
  limit: number
  /** Total items */
  total: number
  /** Total pages */
  totalPages: number
}

export function PaginationMetaFromJSON(json: unknown): PaginationMeta {
  return PaginationMetaFromJSONTyped(json)
}

export function PaginationMetaFromJSONTyped(json: unknown): PaginationMeta {
  if (json == null) {
    return json as PaginationMeta
  }
  const obj = json as Record<string, unknown>
  return {
    page: obj['page'] as number,
    limit: obj['limit'] as number,
    total: obj['total'] as number,
    totalPages: obj['total_pages'] as number,
  }
}

export function PaginationMetaToJSON(value: PaginationMeta): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    page: value.page,
    limit: value.limit,
    total: value.total,
    total_pages: value.totalPages,
  }
}
