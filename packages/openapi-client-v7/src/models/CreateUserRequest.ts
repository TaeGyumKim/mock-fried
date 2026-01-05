/* tslint:disable */
/* eslint-disable */
import { exists, mapValues } from '../runtime';

export interface CreateUserRequest {
    name: string;
    email: string;
    role?: CreateUserRequestRoleEnum;
}

export const CreateUserRequestRoleEnum = {
    Admin: 'admin',
    User: 'user',
    Guest: 'guest'
} as const;
export type CreateUserRequestRoleEnum = typeof CreateUserRequestRoleEnum[keyof typeof CreateUserRequestRoleEnum];

export function instanceOfCreateUserRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "email" in value;
    return isInstance;
}

export function CreateUserRequestFromJSON(json: any): CreateUserRequest {
    return CreateUserRequestFromJSONTyped(json, false);
}

export function CreateUserRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateUserRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        'name': json['name'],
        'email': json['email'],
        'role': !exists(json, 'role') ? undefined : json['role'],
    };
}

export function CreateUserRequestToJSON(value?: CreateUserRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        'name': value.name,
        'email': value.email,
        'role': value.role,
    };
}
