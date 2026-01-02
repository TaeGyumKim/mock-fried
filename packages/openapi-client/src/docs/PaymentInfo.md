
# PaymentInfo


## Properties

Name | Type
------------ | -------------
`method` | string
`status` | string
`amount` | number
`currency` | string

## Example

```typescript
import type { PaymentInfo } from ''

// TODO: Update the object below with actual values
const example = {
  "method": null,
  "status": null,
  "amount": null,
  "currency": null,
} satisfies PaymentInfo

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PaymentInfo
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


