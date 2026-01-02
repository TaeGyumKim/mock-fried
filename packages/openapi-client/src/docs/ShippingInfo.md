
# ShippingInfo


## Properties

Name | Type
------------ | -------------
`method` | string
`address` | [Address](Address.md)
`estimatedDelivery` | Date
`trackingNumber` | string

## Example

```typescript
import type { ShippingInfo } from ''

// TODO: Update the object below with actual values
const example = {
  "method": null,
  "address": null,
  "estimatedDelivery": null,
  "trackingNumber": null,
} satisfies ShippingInfo

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ShippingInfo
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


