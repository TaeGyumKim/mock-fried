/* tslint:disable */
/* eslint-disable */
import { exists, mapValues } from '../runtime';
import type { Comment } from './Comment';
import { CommentFromJSON, CommentFromJSONTyped, CommentToJSON } from './Comment';

export interface CommentListResponse {
    items: Array<Comment>;
    total: number;
}

export function instanceOfCommentListResponse(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "items" in value;
    isInstance = isInstance && "total" in value;
    return isInstance;
}

export function CommentListResponseFromJSON(json: any): CommentListResponse {
    return CommentListResponseFromJSONTyped(json, false);
}

export function CommentListResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): CommentListResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        'items': ((json['items'] as Array<any>).map(CommentFromJSON)),
        'total': json['total'],
    };
}

export function CommentListResponseToJSON(value?: CommentListResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        'items': ((value.items as Array<any>).map(CommentToJSON)),
        'total': value.total,
    };
}
