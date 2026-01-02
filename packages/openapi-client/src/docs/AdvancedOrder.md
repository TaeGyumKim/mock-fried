
# AdvancedOrder


## Properties

Name | Type
------------ | -------------
`id` | string
`customerId` | string
`status` | string
`priority` | string
`items` | [Array&lt;AdvancedOrderItem&gt;](AdvancedOrderItem.md)
`shipping` | [ShippingInfo](ShippingInfo.md)
`payment` | [PaymentInfo](PaymentInfo.md)
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { AdvancedOrder } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "customerId": null,
  "status": null,
  "priority": null,
  "items": null,
  "shipping": null,
  "payment": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies AdvancedOrder

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AdvancedOrder
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


