/* tslint:disable */
/* eslint-disable */
/**
 * Mock-Fried Sample API (v7 format)
 * Sample API for testing openapi-generator v7 format parsing
 *
 * NOTE: This class simulates openapi-generator v7 output format
 * This API demonstrates multiple path parameters with chained .replace() calls
 */

import * as runtime from '../runtime';
import type {
  Comment,
  CommentListResponse,
} from '../models/index';
import {
    CommentFromJSON,
    CommentToJSON,
    CommentListResponseFromJSON,
    CommentListResponseToJSON,
} from '../models/index';

export interface GetCommentsRequest {
    postId: string;
    limit?: number;
}

export interface GetCommentByIdRequest {
    postId: string;
    commentId: string;
}

export interface CreateCommentOperationRequest {
    postId: string;
    content: string;
    authorId: string;
}

export interface UpdateCommentRequest {
    postId: string;
    commentId: string;
    content: string;
}

export interface DeleteCommentRequest {
    postId: string;
    commentId: string;
}

/**
 * Comments API - v7 format with multiple path parameters
 */
export class CommentsApi extends runtime.BaseAPI {

    /**
     * List comments for a post
     */
    async getCommentsRaw(requestParameters: GetCommentsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CommentListResponse>> {
        if (requestParameters.postId === null || requestParameters.postId === undefined) {
            throw new runtime.RequiredError('postId','Required parameter requestParameters.postId was null or undefined when calling getComments.');
        }

        const queryParameters: any = {};

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/posts/{postId}/comments`.replace(`{${"postId"}}`, encodeURIComponent(String(requestParameters.postId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CommentListResponseFromJSON(jsonValue));
    }

    /**
     * List comments for a post
     */
    async getComments(requestParameters: GetCommentsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CommentListResponse> {
        const response = await this.getCommentsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get a specific comment (multiple path params with chained .replace())
     */
    async getCommentByIdRaw(requestParameters: GetCommentByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Comment>> {
        if (requestParameters.postId === null || requestParameters.postId === undefined) {
            throw new runtime.RequiredError('postId','Required parameter requestParameters.postId was null or undefined when calling getCommentById.');
        }

        if (requestParameters.commentId === null || requestParameters.commentId === undefined) {
            throw new runtime.RequiredError('commentId','Required parameter requestParameters.commentId was null or undefined when calling getCommentById.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/posts/{postId}/comments/{commentId}`.replace(`{${"postId"}}`, encodeURIComponent(String(requestParameters.postId))).replace(`{${"commentId"}}`, encodeURIComponent(String(requestParameters.commentId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CommentFromJSON(jsonValue));
    }

    /**
     * Get a specific comment (multiple path params with chained .replace())
     */
    async getCommentById(requestParameters: GetCommentByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Comment> {
        const response = await this.getCommentByIdRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Create a new comment
     */
    async createCommentRaw(requestParameters: CreateCommentOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Comment>> {
        if (requestParameters.postId === null || requestParameters.postId === undefined) {
            throw new runtime.RequiredError('postId','Required parameter requestParameters.postId was null or undefined when calling createComment.');
        }

        if (requestParameters.content === null || requestParameters.content === undefined) {
            throw new runtime.RequiredError('content','Required parameter requestParameters.content was null or undefined when calling createComment.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/posts/{postId}/comments`.replace(`{${"postId"}}`, encodeURIComponent(String(requestParameters.postId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: { content: requestParameters.content, authorId: requestParameters.authorId },
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CommentFromJSON(jsonValue));
    }

    /**
     * Create a new comment
     */
    async createComment(requestParameters: CreateCommentOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Comment> {
        const response = await this.createCommentRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update a comment (multiple path params with chained .replace())
     */
    async updateCommentRaw(requestParameters: UpdateCommentRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Comment>> {
        if (requestParameters.postId === null || requestParameters.postId === undefined) {
            throw new runtime.RequiredError('postId','Required parameter requestParameters.postId was null or undefined when calling updateComment.');
        }

        if (requestParameters.commentId === null || requestParameters.commentId === undefined) {
            throw new runtime.RequiredError('commentId','Required parameter requestParameters.commentId was null or undefined when calling updateComment.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/posts/{postId}/comments/{commentId}`.replace(`{${"postId"}}`, encodeURIComponent(String(requestParameters.postId))).replace(`{${"commentId"}}`, encodeURIComponent(String(requestParameters.commentId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: { content: requestParameters.content },
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CommentFromJSON(jsonValue));
    }

    /**
     * Update a comment (multiple path params with chained .replace())
     */
    async updateComment(requestParameters: UpdateCommentRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Comment> {
        const response = await this.updateCommentRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete a comment (multiple path params with chained .replace())
     */
    async deleteCommentRaw(requestParameters: DeleteCommentRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.postId === null || requestParameters.postId === undefined) {
            throw new runtime.RequiredError('postId','Required parameter requestParameters.postId was null or undefined when calling deleteComment.');
        }

        if (requestParameters.commentId === null || requestParameters.commentId === undefined) {
            throw new runtime.RequiredError('commentId','Required parameter requestParameters.commentId was null or undefined when calling deleteComment.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/posts/{postId}/comments/{commentId}`.replace(`{${"postId"}}`, encodeURIComponent(String(requestParameters.postId))).replace(`{${"commentId"}}`, encodeURIComponent(String(requestParameters.commentId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete a comment (multiple path params with chained .replace())
     */
    async deleteComment(requestParameters: DeleteCommentRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteCommentRaw(requestParameters, initOverrides);
    }

}
