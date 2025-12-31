
# CreateOrderRequest


## Properties

Name | Type
------------ | -------------
`items` | [Array&lt;CreateOrderRequestItemsInner&gt;](CreateOrderRequestItemsInner.md)
`shippingAddress` | string

## Example

```typescript
import type { CreateOrderRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "items": null,
  "shippingAddress": null,
} satisfies CreateOrderRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateOrderRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


