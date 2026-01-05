/* tslint:disable */
/* eslint-disable */
/**
 * Mock-Fried Sample API (v7 format)
 * Sample API for testing openapi-generator v7 format parsing
 *
 * This package simulates openapi-generator v7 output format with:
 * - Inline path in this.request({ path: `...` })
 * - Dot notation: requestParameters.param
 * - Chained .replace() for path parameters
 * - !== undefined/null checks instead of != null
 */
export * from './runtime';
export * from './apis/index';
export * from './models/index';
