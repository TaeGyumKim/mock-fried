/**
 * Runtime utilities for API client
 * Compatible with openapi-generator TypeScript output
 */

export interface ConfigurationParameters {
  basePath?: string
  fetchApi?: typeof fetch
  middleware?: Middleware[]
  headers?: Record<string, string>
  credentials?: RequestCredentials
}

export class Configuration {
  basePath: string
  fetchApi: typeof fetch
  middleware: Middleware[]
  headers: Record<string, string>
  credentials?: RequestCredentials

  constructor(config: ConfigurationParameters = {}) {
    this.basePath = config.basePath ?? ''
    this.fetchApi = config.fetchApi ?? fetch
    this.middleware = config.middleware ?? []
    this.headers = config.headers ?? {}
    this.credentials = config.credentials
  }
}

export interface Middleware {
  pre?(context: RequestContext): Promise<RequestContext>
  post?(context: ResponseContext): Promise<ResponseContext>
}

export interface RequestContext {
  url: string
  init: RequestInit
}

export interface ResponseContext {
  url: string
  init: RequestInit
  response: Response
}

export interface ApiResponse<T> {
  raw: Response
  value(): Promise<T>
}

export class BaseAPI {
  protected configuration: Configuration

  constructor(configuration?: Configuration) {
    this.configuration = configuration ?? new Configuration()
  }

  protected async request<T>(context: RequestContext): Promise<ApiResponse<T>> {
    const response = await this.configuration.fetchApi(context.url, context.init)
    return {
      raw: response,
      value: async () => response.json() as Promise<T>,
    }
  }
}

/**
 * Type guard for runtime type checking
 */
export function exists(json: unknown, key: string): boolean {
  const value = (json as Record<string, unknown>)[key]
  return value !== null && value !== undefined
}

/**
 * Map JSON values
 */
export function mapValues<T, U>(data: Record<string, T>, fn: (item: T) => U): Record<string, U> {
  return Object.keys(data).reduce((acc, key) => {
    acc[key] = fn(data[key]!)
    return acc
  }, {} as Record<string, U>)
}
