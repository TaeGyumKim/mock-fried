/**
 * Product variant - nested object example
 */
import { exists } from '../runtime'

export interface ProductVariant {
  /** Variant ID */
  id: string
  /** Variant name (e.g., "Red / Large") */
  name: string
  /** SKU */
  sku: string
  /** Price override */
  price?: number
  /** Stock quantity */
  stock: number
  /** Color */
  color?: string
  /** Size */
  size?: string
  /** Weight in grams */
  weight?: number
  /** Is available */
  isAvailable: boolean
  /** Image URL */
  imageUrl?: string
}

export function ProductVariantFromJSON(json: unknown): ProductVariant {
  return ProductVariantFromJSONTyped(json)
}

export function ProductVariantFromJSONTyped(json: unknown): ProductVariant {
  if (json == null) {
    return json as ProductVariant
  }
  const obj = json as Record<string, unknown>
  return {
    id: obj['id'] as string,
    name: obj['name'] as string,
    sku: obj['sku'] as string,
    price: exists(obj, 'price') ? obj['price'] as number : undefined,
    stock: obj['stock'] as number,
    color: exists(obj, 'color') ? obj['color'] as string : undefined,
    size: exists(obj, 'size') ? obj['size'] as string : undefined,
    weight: exists(obj, 'weight') ? obj['weight'] as number : undefined,
    isAvailable: obj['is_available'] as boolean,
    imageUrl: exists(obj, 'image_url') ? obj['image_url'] as string : undefined,
  }
}

export function ProductVariantToJSON(value: ProductVariant): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    id: value.id,
    name: value.name,
    sku: value.sku,
    price: value.price,
    stock: value.stock,
    color: value.color,
    size: value.size,
    weight: value.weight,
    is_available: value.isAvailable,
    image_url: value.imageUrl,
  }
}
