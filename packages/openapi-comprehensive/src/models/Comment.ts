/**
 * Comment model - nested resource
 */
import { exists } from '../runtime'

export interface Comment {
  /** Comment ID */
  id: string
  /** Parent post ID */
  postId: string
  /** Author user ID */
  authorId: string
  /** Author name (denormalized) */
  authorName: string
  /** Author avatar */
  authorAvatar?: string
  /** Comment content */
  content: string
  /** Like count */
  likeCount: number
  /** Is edited */
  isEdited?: boolean
  /** Parent comment ID (for replies) */
  parentId?: string
  /** Reply count */
  replyCount?: number
  /** Created timestamp */
  createdAt: Date
  /** Updated timestamp */
  updatedAt: Date
}

export function CommentFromJSON(json: unknown): Comment {
  return CommentFromJSONTyped(json)
}

export function CommentFromJSONTyped(json: unknown): Comment {
  if (json == null) {
    return json as Comment
  }
  const obj = json as Record<string, unknown>
  return {
    id: obj['id'] as string,
    postId: obj['post_id'] as string,
    authorId: obj['author_id'] as string,
    authorName: obj['author_name'] as string,
    authorAvatar: exists(obj, 'author_avatar') ? obj['author_avatar'] as string : undefined,
    content: obj['content'] as string,
    likeCount: obj['like_count'] as number,
    isEdited: exists(obj, 'is_edited') ? obj['is_edited'] as boolean : undefined,
    parentId: exists(obj, 'parent_id') ? obj['parent_id'] as string : undefined,
    replyCount: exists(obj, 'reply_count') ? obj['reply_count'] as number : undefined,
    createdAt: new Date(obj['created_at'] as string),
    updatedAt: new Date(obj['updated_at'] as string),
  }
}

export function CommentToJSON(value: Comment): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    id: value.id,
    post_id: value.postId,
    author_id: value.authorId,
    author_name: value.authorName,
    author_avatar: value.authorAvatar,
    content: value.content,
    like_count: value.likeCount,
    is_edited: value.isEdited,
    parent_id: value.parentId,
    reply_count: value.replyCount,
    created_at: value.createdAt.toISOString(),
    updated_at: value.updatedAt.toISOString(),
  }
}
