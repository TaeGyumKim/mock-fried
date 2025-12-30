/**
 * Order item - nested in Order
 */
import { exists } from '../runtime'

export interface OrderItem {
  /** Item ID */
  id: string
  /** Product ID */
  productId: string
  /** Product name (denormalized) */
  productName: string
  /** Product SKU */
  sku: string
  /** Quantity */
  quantity: number
  /** Unit price */
  unitPrice: number
  /** Total price */
  totalPrice: number
  /** Product image */
  imageUrl?: string
  /** Variant info */
  variantName?: string
}

export function OrderItemFromJSON(json: unknown): OrderItem {
  return OrderItemFromJSONTyped(json)
}

export function OrderItemFromJSONTyped(json: unknown): OrderItem {
  if (json == null) {
    return json as OrderItem
  }
  const obj = json as Record<string, unknown>
  return {
    id: obj['id'] as string,
    productId: obj['product_id'] as string,
    productName: obj['product_name'] as string,
    sku: obj['sku'] as string,
    quantity: obj['quantity'] as number,
    unitPrice: obj['unit_price'] as number,
    totalPrice: obj['total_price'] as number,
    imageUrl: exists(obj, 'image_url') ? obj['image_url'] as string : undefined,
    variantName: exists(obj, 'variant_name') ? obj['variant_name'] as string : undefined,
  }
}

export function OrderItemToJSON(value: OrderItem): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    id: value.id,
    product_id: value.productId,
    product_name: value.productName,
    sku: value.sku,
    quantity: value.quantity,
    unit_price: value.unitPrice,
    total_price: value.totalPrice,
    image_url: value.imageUrl,
    variant_name: value.variantName,
  }
}
