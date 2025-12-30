/**
 * User role enum
 */
export const UserRole = {
  Admin: 'ADMIN',
  User: 'USER',
  Guest: 'GUEST',
  Moderator: 'MODERATOR',
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

export function UserRoleFromJSON(json: unknown): UserRole {
  return UserRoleFromJSONTyped(json)
}

export function UserRoleFromJSONTyped(json: unknown): UserRole {
  return json as UserRole
}

export function UserRoleToJSON(value: UserRole): string {
  return value
}
