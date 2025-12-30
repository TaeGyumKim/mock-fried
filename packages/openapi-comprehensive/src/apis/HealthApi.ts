/**
 * Health API - primitive responses
 */
import { BaseAPI, type ApiResponse } from '../runtime'
import type { HealthResponse } from '../models'

export class HealthApi extends BaseAPI {
  /**
   * Health check endpoint
   * @summary Check service health
   */
  async getHealthRaw(): Promise<ApiResponse<HealthResponse>> {
    return this.request<HealthResponse>({
      url: `${this.configuration.basePath}/health`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Get service version
   * @summary Get version string
   */
  async getVersionRaw(): Promise<ApiResponse<string>> {
    return this.request<string>({
      url: `${this.configuration.basePath}/version`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Ping endpoint
   * @summary Simple ping
   */
  async pingRaw(): Promise<ApiResponse<string>> {
    return this.request<string>({
      url: `${this.configuration.basePath}/ping`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }

  /**
   * Get tags list (simple string array)
   * @summary Get available tags
   */
  async getTagsRaw(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>({
      url: `${this.configuration.basePath}/tags`,
      init: {
        method: 'GET',
        headers: this.configuration.headers,
      },
    })
  }
}
