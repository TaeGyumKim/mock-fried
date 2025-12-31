
# OrderItem


## Properties

Name | Type
------------ | -------------
`productId` | string
`productName` | string
`quantity` | number
`price` | number

## Example

```typescript
import type { OrderItem } from ''

// TODO: Update the object below with actual values
const example = {
  "productId": null,
  "productName": null,
  "quantity": null,
  "price": null,
} satisfies OrderItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OrderItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


