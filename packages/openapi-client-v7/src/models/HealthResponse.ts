/* tslint:disable */
/* eslint-disable */
import { exists, mapValues } from '../runtime';

export interface HealthResponse {
    status: string;
    timestamp: Date;
    version?: string;
}

export function instanceOfHealthResponse(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "status" in value;
    isInstance = isInstance && "timestamp" in value;
    return isInstance;
}

export function HealthResponseFromJSON(json: any): HealthResponse {
    return HealthResponseFromJSONTyped(json, false);
}

export function HealthResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): HealthResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        'status': json['status'],
        'timestamp': new Date(json['timestamp']),
        'version': !exists(json, 'version') ? undefined : json['version'],
    };
}

export function HealthResponseToJSON(value?: HealthResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        'status': value.status,
        'timestamp': value.timestamp.toISOString(),
        'version': value.version,
    };
}
