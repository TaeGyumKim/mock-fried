/* tslint:disable */
/* eslint-disable */
import { exists, mapValues } from '../runtime';
import type { Post } from './Post';
import { PostFromJSON, PostFromJSONTyped, PostToJSON } from './Post';

export interface PostListResponse {
    items: Array<Post>;
    nextCursor?: string;
    hasMore: boolean;
}

export function instanceOfPostListResponse(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "items" in value;
    isInstance = isInstance && "hasMore" in value;
    return isInstance;
}

export function PostListResponseFromJSON(json: any): PostListResponse {
    return PostListResponseFromJSONTyped(json, false);
}

export function PostListResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): PostListResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        'items': ((json['items'] as Array<any>).map(PostFromJSON)),
        'nextCursor': !exists(json, 'nextCursor') ? undefined : json['nextCursor'],
        'hasMore': json['hasMore'],
    };
}

export function PostListResponseToJSON(value?: PostListResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        'items': ((value.items as Array<any>).map(PostToJSON)),
        'nextCursor': value.nextCursor,
        'hasMore': value.hasMore,
    };
}
