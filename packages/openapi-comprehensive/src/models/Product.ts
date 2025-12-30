/**
 * Product model - with nested variants
 */
import { exists } from '../runtime'
import type { ProductCategory } from './ProductCategory'
import { ProductCategoryFromJSON, ProductCategoryToJSON } from './ProductCategory'
import type { ProductVariant } from './ProductVariant'
import { ProductVariantFromJSON, ProductVariantToJSON } from './ProductVariant'

export interface Product {
  /** Unique identifier */
  id: string
  /** Product name */
  name: string
  /** Product description */
  description: string
  /** Short description */
  shortDescription?: string
  /** Product category */
  category: ProductCategory
  /** Base price */
  price: number
  /** Sale price */
  salePrice?: number
  /** Currency code */
  currency: string
  /** SKU */
  sku: string
  /** Stock quantity */
  stock: number
  /** Main image URL */
  imageUrl: string
  /** Additional images */
  images?: string[]
  /** Product variants */
  variants?: ProductVariant[]
  /** Tags */
  tags?: string[]
  /** Average rating (1-5) */
  rating?: number
  /** Review count */
  reviewCount?: number
  /** Is featured */
  isFeatured?: boolean
  /** Is active */
  isActive: boolean
  /** Weight in grams */
  weight?: number
  /** Dimensions */
  dimensions?: {
    width: number
    height: number
    depth: number
  }
  /** Created timestamp */
  createdAt: Date
  /** Updated timestamp */
  updatedAt: Date
}

export function ProductFromJSON(json: unknown): Product {
  return ProductFromJSONTyped(json)
}

export function ProductFromJSONTyped(json: unknown): Product {
  if (json == null) {
    return json as Product
  }
  const obj = json as Record<string, unknown>
  return {
    id: obj['id'] as string,
    name: obj['name'] as string,
    description: obj['description'] as string,
    shortDescription: exists(obj, 'short_description') ? obj['short_description'] as string : undefined,
    category: ProductCategoryFromJSON(obj['category']),
    price: obj['price'] as number,
    salePrice: exists(obj, 'sale_price') ? obj['sale_price'] as number : undefined,
    currency: obj['currency'] as string,
    sku: obj['sku'] as string,
    stock: obj['stock'] as number,
    imageUrl: obj['image_url'] as string,
    images: exists(obj, 'images') ? obj['images'] as string[] : undefined,
    variants: exists(obj, 'variants')
      ? (obj['variants'] as unknown[]).map(ProductVariantFromJSON)
      : undefined,
    tags: exists(obj, 'tags') ? obj['tags'] as string[] : undefined,
    rating: exists(obj, 'rating') ? obj['rating'] as number : undefined,
    reviewCount: exists(obj, 'review_count') ? obj['review_count'] as number : undefined,
    isFeatured: exists(obj, 'is_featured') ? obj['is_featured'] as boolean : undefined,
    isActive: obj['is_active'] as boolean,
    weight: exists(obj, 'weight') ? obj['weight'] as number : undefined,
    dimensions: exists(obj, 'dimensions') ? obj['dimensions'] as { width: number, height: number, depth: number } : undefined,
    createdAt: new Date(obj['created_at'] as string),
    updatedAt: new Date(obj['updated_at'] as string),
  }
}

export function ProductToJSON(value: Product): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    id: value.id,
    name: value.name,
    description: value.description,
    short_description: value.shortDescription,
    category: ProductCategoryToJSON(value.category),
    price: value.price,
    sale_price: value.salePrice,
    currency: value.currency,
    sku: value.sku,
    stock: value.stock,
    image_url: value.imageUrl,
    images: value.images,
    variants: value.variants?.map(ProductVariantToJSON),
    tags: value.tags,
    rating: value.rating,
    review_count: value.reviewCount,
    is_featured: value.isFeatured,
    is_active: value.isActive,
    weight: value.weight,
    dimensions: value.dimensions,
    created_at: value.createdAt.toISOString(),
    updated_at: value.updatedAt.toISOString(),
  }
}
