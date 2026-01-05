/* tslint:disable */
/* eslint-disable */
/**
 * Mock-Fried Sample API (v7 format)
 * Sample API for testing openapi-generator v7 format parsing
 *
 * NOTE: This class simulates openapi-generator v7 output format
 * Key differences from older format:
 * - Uses inline path in this.request({ path: `...` })
 * - Uses dot notation: requestParameters.param
 * - Uses chained .replace() for path params
 */

import * as runtime from '../runtime';
import type {
  CreateUserRequest,
  User,
  UserListResponse,
} from '../models/index';
import {
    CreateUserRequestFromJSON,
    CreateUserRequestToJSON,
    UserFromJSON,
    UserToJSON,
    UserListResponseFromJSON,
    UserListResponseToJSON,
} from '../models/index';

export interface CreateUserOperationRequest {
    createUserRequest: CreateUserRequest;
}

export interface DeleteUserRequest {
    id: string;
}

export interface GetUserByIdRequest {
    id: string;
}

export interface GetUsersRequest {
    page?: number;
    limit?: number;
    status?: GetUsersStatusEnum;
    role?: GetUsersRoleEnum;
    search?: string;
}

export interface UpdateUserOperationRequest {
    id: string;
    name?: string;
    email?: string;
}

/**
 * Users API - v7 format (inline path, dot notation)
 */
export class UsersApi extends runtime.BaseAPI {

    /**
     * Create a new user
     */
    async createUserRaw(requestParameters: CreateUserOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>> {
        if (requestParameters.createUserRequest === null || requestParameters.createUserRequest === undefined) {
            throw new runtime.RequiredError('createUserRequest','Required parameter requestParameters.createUserRequest was null or undefined when calling createUser.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/users`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateUserRequestToJSON(requestParameters.createUserRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
    }

    /**
     * Create a new user
     */
    async createUser(requestParameters: CreateUserOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User> {
        const response = await this.createUserRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete user
     */
    async deleteUserRaw(requestParameters: DeleteUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling deleteUser.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/users/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete user
     */
    async deleteUser(requestParameters: DeleteUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteUserRaw(requestParameters, initOverrides);
    }

    /**
     * Get user by ID
     */
    async getUserByIdRaw(requestParameters: GetUserByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling getUserById.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/users/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
    }

    /**
     * Get user by ID
     */
    async getUserById(requestParameters: GetUserByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User> {
        const response = await this.getUserByIdRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * List all users with pagination
     */
    async getUsersRaw(requestParameters: GetUsersRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserListResponse>> {
        const queryParameters: any = {};

        if (requestParameters.page !== undefined) {
            queryParameters['page'] = requestParameters.page;
        }

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        if (requestParameters.status !== undefined) {
            queryParameters['status'] = requestParameters.status;
        }

        if (requestParameters.role !== undefined) {
            queryParameters['role'] = requestParameters.role;
        }

        if (requestParameters.search !== undefined) {
            queryParameters['search'] = requestParameters.search;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/users`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserListResponseFromJSON(jsonValue));
    }

    /**
     * List all users with pagination
     */
    async getUsers(requestParameters: GetUsersRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserListResponse> {
        const response = await this.getUsersRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update user
     */
    async updateUserRaw(requestParameters: UpdateUserOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling updateUser.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/users/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: { name: requestParameters.name, email: requestParameters.email },
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
    }

    /**
     * Update user
     */
    async updateUser(requestParameters: UpdateUserOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User> {
        const response = await this.updateUserRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const GetUsersStatusEnum = {
    Active: 'active',
    Inactive: 'inactive',
    Suspended: 'suspended'
} as const;
export type GetUsersStatusEnum = typeof GetUsersStatusEnum[keyof typeof GetUsersStatusEnum];

/**
 * @export
 */
export const GetUsersRoleEnum = {
    Admin: 'admin',
    User: 'user',
    Guest: 'guest'
} as const;
export type GetUsersRoleEnum = typeof GetUsersRoleEnum[keyof typeof GetUsersRoleEnum];
