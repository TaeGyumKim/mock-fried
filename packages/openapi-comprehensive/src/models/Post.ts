/**
 * Post model - blog/social post
 */
import { exists } from '../runtime'

export interface Post {
  /** Unique identifier */
  id: string
  /** Post title */
  title: string
  /** Post content/body */
  content: string
  /** Short excerpt */
  excerpt?: string
  /** Author user ID */
  authorId: string
  /** Author name (denormalized) */
  authorName?: string
  /** Featured image URL */
  imageUrl?: string
  /** Tags */
  tags?: string[]
  /** Is published */
  isPublished: boolean
  /** Is featured */
  isFeatured?: boolean
  /** View count */
  viewCount: number
  /** Like count */
  likeCount: number
  /** Comment count */
  commentCount: number
  /** Created timestamp */
  createdAt: Date
  /** Updated timestamp */
  updatedAt: Date
  /** Published timestamp */
  publishedAt?: Date
}

export function PostFromJSON(json: unknown): Post {
  return PostFromJSONTyped(json)
}

export function PostFromJSONTyped(json: unknown): Post {
  if (json == null) {
    return json as Post
  }
  const obj = json as Record<string, unknown>
  return {
    id: obj['id'] as string,
    title: obj['title'] as string,
    content: obj['content'] as string,
    excerpt: exists(obj, 'excerpt') ? obj['excerpt'] as string : undefined,
    authorId: obj['author_id'] as string,
    authorName: exists(obj, 'author_name') ? obj['author_name'] as string : undefined,
    imageUrl: exists(obj, 'image_url') ? obj['image_url'] as string : undefined,
    tags: exists(obj, 'tags') ? obj['tags'] as string[] : undefined,
    isPublished: obj['is_published'] as boolean,
    isFeatured: exists(obj, 'is_featured') ? obj['is_featured'] as boolean : undefined,
    viewCount: obj['view_count'] as number,
    likeCount: obj['like_count'] as number,
    commentCount: obj['comment_count'] as number,
    createdAt: new Date(obj['created_at'] as string),
    updatedAt: new Date(obj['updated_at'] as string),
    publishedAt: exists(obj, 'published_at') ? new Date(obj['published_at'] as string) : undefined,
  }
}

export function PostToJSON(value: Post): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    id: value.id,
    title: value.title,
    content: value.content,
    excerpt: value.excerpt,
    author_id: value.authorId,
    author_name: value.authorName,
    image_url: value.imageUrl,
    tags: value.tags,
    is_published: value.isPublished,
    is_featured: value.isFeatured,
    view_count: value.viewCount,
    like_count: value.likeCount,
    comment_count: value.commentCount,
    created_at: value.createdAt.toISOString(),
    updated_at: value.updatedAt.toISOString(),
    published_at: value.publishedAt?.toISOString(),
  }
}
