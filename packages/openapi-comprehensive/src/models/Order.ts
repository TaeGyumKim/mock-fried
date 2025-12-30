/**
 * Order model - with nested items
 */
import { exists } from '../runtime'
import type { OrderStatus } from './OrderStatus'
import { OrderStatusFromJSON, OrderStatusToJSON } from './OrderStatus'
import type { OrderItem } from './OrderItem'
import { OrderItemFromJSON, OrderItemToJSON } from './OrderItem'

export interface Order {
  /** Order ID */
  id: string
  /** Order number */
  orderNumber: string
  /** Customer user ID */
  userId: string
  /** Customer email */
  email: string
  /** Order status */
  status: OrderStatus
  /** Order items */
  items: OrderItem[]
  /** Subtotal */
  subtotal: number
  /** Tax amount */
  tax: number
  /** Shipping cost */
  shippingCost: number
  /** Discount amount */
  discount?: number
  /** Total amount */
  total: number
  /** Currency */
  currency: string
  /** Shipping address */
  shippingAddress: {
    street: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  /** Billing address */
  billingAddress?: {
    street: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  /** Payment method */
  paymentMethod?: string
  /** Notes */
  notes?: string
  /** Created timestamp */
  createdAt: Date
  /** Updated timestamp */
  updatedAt: Date
  /** Shipped timestamp */
  shippedAt?: Date
  /** Delivered timestamp */
  deliveredAt?: Date
}

export function OrderFromJSON(json: unknown): Order {
  return OrderFromJSONTyped(json)
}

export function OrderFromJSONTyped(json: unknown): Order {
  if (json == null) {
    return json as Order
  }
  const obj = json as Record<string, unknown>
  return {
    id: obj['id'] as string,
    orderNumber: obj['order_number'] as string,
    userId: obj['user_id'] as string,
    email: obj['email'] as string,
    status: OrderStatusFromJSON(obj['status']),
    items: (obj['items'] as unknown[]).map(OrderItemFromJSON),
    subtotal: obj['subtotal'] as number,
    tax: obj['tax'] as number,
    shippingCost: obj['shipping_cost'] as number,
    discount: exists(obj, 'discount') ? obj['discount'] as number : undefined,
    total: obj['total'] as number,
    currency: obj['currency'] as string,
    shippingAddress: obj['shipping_address'] as Order['shippingAddress'],
    billingAddress: exists(obj, 'billing_address') ? obj['billing_address'] as Order['billingAddress'] : undefined,
    paymentMethod: exists(obj, 'payment_method') ? obj['payment_method'] as string : undefined,
    notes: exists(obj, 'notes') ? obj['notes'] as string : undefined,
    createdAt: new Date(obj['created_at'] as string),
    updatedAt: new Date(obj['updated_at'] as string),
    shippedAt: exists(obj, 'shipped_at') ? new Date(obj['shipped_at'] as string) : undefined,
    deliveredAt: exists(obj, 'delivered_at') ? new Date(obj['delivered_at'] as string) : undefined,
  }
}

export function OrderToJSON(value: Order): Record<string, unknown> {
  if (value == null) {
    return value
  }
  return {
    id: value.id,
    order_number: value.orderNumber,
    user_id: value.userId,
    email: value.email,
    status: OrderStatusToJSON(value.status),
    items: value.items.map(OrderItemToJSON),
    subtotal: value.subtotal,
    tax: value.tax,
    shipping_cost: value.shippingCost,
    discount: value.discount,
    total: value.total,
    currency: value.currency,
    shipping_address: value.shippingAddress,
    billing_address: value.billingAddress,
    payment_method: value.paymentMethod,
    notes: value.notes,
    created_at: value.createdAt.toISOString(),
    updated_at: value.updatedAt.toISOString(),
    shipped_at: value.shippedAt?.toISOString(),
    delivered_at: value.deliveredAt?.toISOString(),
  }
}
