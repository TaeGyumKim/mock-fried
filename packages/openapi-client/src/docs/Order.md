
# Order


## Properties

Name | Type
------------ | -------------
`id` | string
`userId` | string
`status` | string
`items` | [Array&lt;OrderItem&gt;](OrderItem.md)
`total` | number
`currency` | string
`shippingAddress` | string
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { Order } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "userId": null,
  "status": null,
  "items": null,
  "total": null,
  "currency": null,
  "shippingAddress": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies Order

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Order
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


