/* tslint:disable */
/* eslint-disable */
import { exists, mapValues } from '../runtime';

export interface User {
    id: string;
    name: string;
    email: string;
    status: UserStatusEnum;
    role: UserRoleEnum;
    createdAt?: Date;
}

export const UserStatusEnum = {
    Active: 'active',
    Inactive: 'inactive',
    Suspended: 'suspended'
} as const;
export type UserStatusEnum = typeof UserStatusEnum[keyof typeof UserStatusEnum];

export const UserRoleEnum = {
    Admin: 'admin',
    User: 'user',
    Guest: 'guest'
} as const;
export type UserRoleEnum = typeof UserRoleEnum[keyof typeof UserRoleEnum];

export function instanceOfUser(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "email" in value;
    return isInstance;
}

export function UserFromJSON(json: any): User {
    return UserFromJSONTyped(json, false);
}

export function UserFromJSONTyped(json: any, ignoreDiscriminator: boolean): User {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        'id': json['id'],
        'name': json['name'],
        'email': json['email'],
        'status': json['status'],
        'role': json['role'],
        'createdAt': !exists(json, 'createdAt') ? undefined : (new Date(json['createdAt'])),
    };
}

export function UserToJSON(value?: User | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        'id': value.id,
        'name': value.name,
        'email': value.email,
        'status': value.status,
        'role': value.role,
        'createdAt': value.createdAt === undefined ? undefined : (value.createdAt.toISOString()),
    };
}
