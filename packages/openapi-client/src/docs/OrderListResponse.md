
# OrderListResponse


## Properties

Name | Type
------------ | -------------
`items` | [Array&lt;Order&gt;](Order.md)
`pagination` | [PaginationMeta](PaginationMeta.md)

## Example

```typescript
import type { OrderListResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "items": null,
  "pagination": null,
} satisfies OrderListResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OrderListResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


