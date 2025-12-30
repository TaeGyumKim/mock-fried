/**
 * Health check response - primitive object example
 */

export interface HealthResponse {
  /** Service status */
  status: 'ok' | 'degraded' | 'error'
  /** Service version */
  version: string
  /** Uptime in seconds */
  uptime?: number
  /** Timestamp */
  timestamp: string
}

export function HealthResponseFromJSON(json: unknown): HealthResponse {
  return HealthResponseFromJSONTyped(json)
}

export function HealthResponseFromJSONTyped(json: unknown): HealthResponse {
  if (json == null) {
    return json as HealthResponse
  }
  const obj = json as Record<string, unknown>
  return {
    status: obj['status'] as HealthResponse['status'],
    version: obj['version'] as string,
    uptime: obj['uptime'] as number | undefined,
    timestamp: obj['timestamp'] as string,
  }
}

export function HealthResponseToJSON(value: HealthResponse): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    status: value.status,
    version: value.version,
    uptime: value.uptime,
    timestamp: value.timestamp,
  }
}
