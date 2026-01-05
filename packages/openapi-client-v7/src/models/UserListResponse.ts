/* tslint:disable */
/* eslint-disable */
import { exists, mapValues } from '../runtime';
import type { User } from './User';
import { UserFromJSON, UserFromJSONTyped, UserToJSON } from './User';

export interface UserListResponse {
    items: Array<User>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export function instanceOfUserListResponse(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "items" in value;
    isInstance = isInstance && "total" in value;
    return isInstance;
}

export function UserListResponseFromJSON(json: any): UserListResponse {
    return UserListResponseFromJSONTyped(json, false);
}

export function UserListResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserListResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        'items': ((json['items'] as Array<any>).map(UserFromJSON)),
        'total': json['total'],
        'page': json['page'],
        'limit': json['limit'],
        'totalPages': json['totalPages'],
    };
}

export function UserListResponseToJSON(value?: UserListResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        'items': ((value.items as Array<any>).map(UserToJSON)),
        'total': value.total,
        'page': value.page,
        'limit': value.limit,
        'totalPages': value.totalPages,
    };
}
