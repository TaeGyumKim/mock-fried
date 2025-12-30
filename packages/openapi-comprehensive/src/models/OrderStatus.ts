/**
 * Order status enum
 */
export const OrderStatus = {
  Pending: 'PENDING',
  Confirmed: 'CONFIRMED',
  Processing: 'PROCESSING',
  Shipped: 'SHIPPED',
  Delivered: 'DELIVERED',
  Cancelled: 'CANCELLED',
  Refunded: 'REFUNDED',
} as const

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus]

export function OrderStatusFromJSON(json: unknown): OrderStatus {
  return OrderStatusFromJSONTyped(json)
}

export function OrderStatusFromJSONTyped(json: unknown): OrderStatus {
  return json as OrderStatus
}

export function OrderStatusToJSON(value: OrderStatus): string {
  return value
}
