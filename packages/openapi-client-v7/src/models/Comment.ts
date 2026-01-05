/* tslint:disable */
/* eslint-disable */
import { exists, mapValues } from '../runtime';

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    content: string;
    createdAt?: Date;
}

export function instanceOfComment(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "postId" in value;
    isInstance = isInstance && "content" in value;
    return isInstance;
}

export function CommentFromJSON(json: any): Comment {
    return CommentFromJSONTyped(json, false);
}

export function CommentFromJSONTyped(json: any, ignoreDiscriminator: boolean): Comment {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        'id': json['id'],
        'postId': json['postId'],
        'authorId': json['authorId'],
        'content': json['content'],
        'createdAt': !exists(json, 'createdAt') ? undefined : (new Date(json['createdAt'])),
    };
}

export function CommentToJSON(value?: Comment | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        'id': value.id,
        'postId': value.postId,
        'authorId': value.authorId,
        'content': value.content,
        'createdAt': value.createdAt === undefined ? undefined : (value.createdAt.toISOString()),
    };
}
