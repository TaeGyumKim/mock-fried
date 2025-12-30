/**
 * User model - comprehensive user data
 */
import { exists } from '../runtime'
import type { UserRole } from './UserRole'
import { UserRoleFromJSON, UserRoleToJSON } from './UserRole'
import type { UserStatus } from './UserStatus'
import { UserStatusFromJSON, UserStatusToJSON } from './UserStatus'

export interface User {
  /** Unique identifier (UUID format) */
  id: string
  /** Username */
  username: string
  /** Email address */
  email: string
  /** Display name */
  name?: string
  /** User role */
  role: UserRole
  /** User status */
  status: UserStatus
  /** Avatar URL */
  avatarUrl?: string
  /** Phone number */
  phone?: string
  /** Bio/description */
  bio?: string
  /** Account is verified */
  isVerified: boolean
  /** Account is active */
  isActive: boolean
  /** Has newsletter subscription */
  hasNewsletter?: boolean
  /** Date of birth */
  birthDate?: Date
  /** Created timestamp */
  createdAt: Date
  /** Updated timestamp */
  updatedAt: Date
  /** Last login timestamp */
  lastLoginAt?: Date
  /** Post count */
  postCount?: number
  /** Follower count */
  followerCount?: number
  /** Following count */
  followingCount?: number
}

export function UserFromJSON(json: unknown): User {
  return UserFromJSONTyped(json)
}

export function UserFromJSONTyped(json: unknown): User {
  if (json == null) {
    return json as User
  }
  const obj = json as Record<string, unknown>
  return {
    id: obj['id'] as string,
    username: obj['username'] as string,
    email: obj['email'] as string,
    name: exists(obj, 'name') ? obj['name'] as string : undefined,
    role: UserRoleFromJSON(obj['role']),
    status: UserStatusFromJSON(obj['status']),
    avatarUrl: exists(obj, 'avatar_url') ? obj['avatar_url'] as string : undefined,
    phone: exists(obj, 'phone') ? obj['phone'] as string : undefined,
    bio: exists(obj, 'bio') ? obj['bio'] as string : undefined,
    isVerified: obj['is_verified'] as boolean,
    isActive: obj['is_active'] as boolean,
    hasNewsletter: exists(obj, 'has_newsletter') ? obj['has_newsletter'] as boolean : undefined,
    birthDate: exists(obj, 'birth_date') ? new Date(obj['birth_date'] as string) : undefined,
    createdAt: new Date(obj['created_at'] as string),
    updatedAt: new Date(obj['updated_at'] as string),
    lastLoginAt: exists(obj, 'last_login_at') ? new Date(obj['last_login_at'] as string) : undefined,
    postCount: exists(obj, 'post_count') ? obj['post_count'] as number : undefined,
    followerCount: exists(obj, 'follower_count') ? obj['follower_count'] as number : undefined,
    followingCount: exists(obj, 'following_count') ? obj['following_count'] as number : undefined,
  }
}

export function UserToJSON(value: User): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    id: value.id,
    username: value.username,
    email: value.email,
    name: value.name,
    role: UserRoleToJSON(value.role),
    status: UserStatusToJSON(value.status),
    avatar_url: value.avatarUrl,
    phone: value.phone,
    bio: value.bio,
    is_verified: value.isVerified,
    is_active: value.isActive,
    has_newsletter: value.hasNewsletter,
    birth_date: value.birthDate?.toISOString(),
    created_at: value.createdAt.toISOString(),
    updated_at: value.updatedAt.toISOString(),
    last_login_at: value.lastLoginAt?.toISOString(),
    post_count: value.postCount,
    follower_count: value.followerCount,
    following_count: value.followingCount,
  }
}
