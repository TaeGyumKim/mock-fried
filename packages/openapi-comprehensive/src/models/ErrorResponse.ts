/**
 * Error response - RFC 7807 Problem Details
 */
import { exists } from '../runtime'

export interface ErrorResponse {
  /** Error type URI */
  type?: string
  /** Error title */
  title: string
  /** HTTP status code */
  status: number
  /** Detailed error message */
  detail?: string
  /** Instance URI */
  instance?: string
  /** Error code */
  code?: string
  /** Validation errors */
  errors?: Array<{
    field: string
    message: string
    code?: string
  }>
}

export function ErrorResponseFromJSON(json: unknown): ErrorResponse {
  return ErrorResponseFromJSONTyped(json)
}

export function ErrorResponseFromJSONTyped(json: unknown): ErrorResponse {
  if (json == null) {
    return json as ErrorResponse
  }
  const obj = json as Record<string, unknown>
  return {
    type: exists(obj, 'type') ? obj['type'] as string : undefined,
    title: obj['title'] as string,
    status: obj['status'] as number,
    detail: exists(obj, 'detail') ? obj['detail'] as string : undefined,
    instance: exists(obj, 'instance') ? obj['instance'] as string : undefined,
    code: exists(obj, 'code') ? obj['code'] as string : undefined,
    errors: exists(obj, 'errors') ? obj['errors'] as ErrorResponse['errors'] : undefined,
  }
}

export function ErrorResponseToJSON(value: ErrorResponse): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    type: value.type,
    title: value.title,
    status: value.status,
    detail: value.detail,
    instance: value.instance,
    code: value.code,
    errors: value.errors,
  }
}
