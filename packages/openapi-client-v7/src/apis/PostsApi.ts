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
  Post,
  PostListResponse,
} from '../models/index';
import {
    PostFromJSON,
    PostToJSON,
    PostListResponseFromJSON,
    PostListResponseToJSON,
} from '../models/index';

export interface CreatePostRequest {
    title: string;
    content: string;
    authorId: string;
}

export interface GetPostByIdRequest {
    postId: string;
}

export interface GetPostsRequest {
    cursor?: string;
    limit?: number;
}

export interface GetPostsByAuthorRequest {
    authorId: string;
    cursor?: string;
    limit?: number;
}

/**
 * Posts API - v7 format with cursor pagination
 */
export class PostsApi extends runtime.BaseAPI {

    /**
     * Create a new post
     */
    async createPostRaw(requestParameters: CreatePostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Post>> {
        if (requestParameters.title === null || requestParameters.title === undefined) {
            throw new runtime.RequiredError('title','Required parameter requestParameters.title was null or undefined when calling createPost.');
        }

        if (requestParameters.content === null || requestParameters.content === undefined) {
            throw new runtime.RequiredError('content','Required parameter requestParameters.content was null or undefined when calling createPost.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/posts`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: { title: requestParameters.title, content: requestParameters.content, authorId: requestParameters.authorId },
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PostFromJSON(jsonValue));
    }

    /**
     * Create a new post
     */
    async createPost(requestParameters: CreatePostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Post> {
        const response = await this.createPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get post by ID
     */
    async getPostByIdRaw(requestParameters: GetPostByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Post>> {
        if (requestParameters.postId === null || requestParameters.postId === undefined) {
            throw new runtime.RequiredError('postId','Required parameter requestParameters.postId was null or undefined when calling getPostById.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/posts/{postId}`.replace(`{${"postId"}}`, encodeURIComponent(String(requestParameters.postId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PostFromJSON(jsonValue));
    }

    /**
     * Get post by ID
     */
    async getPostById(requestParameters: GetPostByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Post> {
        const response = await this.getPostByIdRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * List all posts with cursor pagination
     */
    async getPostsRaw(requestParameters: GetPostsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<PostListResponse>> {
        const queryParameters: any = {};

        if (requestParameters.cursor !== undefined) {
            queryParameters['cursor'] = requestParameters.cursor;
        }

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/posts`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PostListResponseFromJSON(jsonValue));
    }

    /**
     * List all posts with cursor pagination
     */
    async getPosts(requestParameters: GetPostsRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<PostListResponse> {
        const response = await this.getPostsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * List posts by author with cursor pagination (multiple path params example)
     */
    async getPostsByAuthorRaw(requestParameters: GetPostsByAuthorRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<PostListResponse>> {
        if (requestParameters.authorId === null || requestParameters.authorId === undefined) {
            throw new runtime.RequiredError('authorId','Required parameter requestParameters.authorId was null or undefined when calling getPostsByAuthor.');
        }

        const queryParameters: any = {};

        if (requestParameters.cursor !== undefined) {
            queryParameters['cursor'] = requestParameters.cursor;
        }

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/users/{authorId}/posts`.replace(`{${"authorId"}}`, encodeURIComponent(String(requestParameters.authorId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PostListResponseFromJSON(jsonValue));
    }

    /**
     * List posts by author with cursor pagination (multiple path params example)
     */
    async getPostsByAuthor(requestParameters: GetPostsByAuthorRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<PostListResponse> {
        const response = await this.getPostsByAuthorRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
