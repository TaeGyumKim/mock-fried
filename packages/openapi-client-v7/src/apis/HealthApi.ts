/* tslint:disable */
/* eslint-disable */
/**
 * Mock-Fried Sample API (v7 format)
 * Sample API for testing openapi-generator v7 format parsing
 *
 * NOTE: This class simulates openapi-generator v7 output format
 */

import * as runtime from '../runtime';
import type {
  HealthResponse,
} from '../models/index';
import {
    HealthResponseFromJSON,
    HealthResponseToJSON,
} from '../models/index';

/**
 * Health API - v7 format (no request parameters)
 */
export class HealthApi extends runtime.BaseAPI {

    /**
     * Get health status
     */
    async getHealthRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<HealthResponse>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/health`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => HealthResponseFromJSON(jsonValue));
    }

    /**
     * Get health status
     */
    async getHealth(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<HealthResponse> {
        const response = await this.getHealthRaw(initOverrides);
        return await response.value();
    }

    /**
     * Get version info
     */
    async getVersionRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<object>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/version`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     * Get version info
     */
    async getVersion(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<object> {
        const response = await this.getVersionRaw(initOverrides);
        return await response.value();
    }

    /**
     * Ping endpoint
     */
    async pingRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/ping`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<string>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     * Ping endpoint
     */
    async ping(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string> {
        const response = await this.pingRaw(initOverrides);
        return await response.value();
    }

}
