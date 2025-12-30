/**
 * User status enum
 */
export const UserStatus = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE',
  Pending: 'PENDING',
  Suspended: 'SUSPENDED',
  Deleted: 'DELETED',
} as const

export type UserStatus = typeof UserStatus[keyof typeof UserStatus]

export function UserStatusFromJSON(json: unknown): UserStatus {
  return UserStatusFromJSONTyped(json)
}

export function UserStatusFromJSONTyped(json: unknown): UserStatus {
  return json as UserStatus
}

export function UserStatusToJSON(value: UserStatus): string {
  return value
}
