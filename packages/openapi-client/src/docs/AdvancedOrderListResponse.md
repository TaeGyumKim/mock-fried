
# AdvancedOrderListResponse


## Properties

Name | Type
------------ | -------------
`items` | [Array&lt;AdvancedOrder&gt;](AdvancedOrder.md)
`page` | number
`totalPages` | number
`total` | number
`limit` | number

## Example

```typescript
import type { AdvancedOrderListResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "items": null,
  "page": null,
  "totalPages": null,
  "total": null,
  "limit": null,
} satisfies AdvancedOrderListResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AdvancedOrderListResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


