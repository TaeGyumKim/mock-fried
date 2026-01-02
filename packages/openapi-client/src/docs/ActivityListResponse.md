
# ActivityListResponse


## Properties

Name | Type
------------ | -------------
`items` | [Array&lt;Activity&gt;](Activity.md)
`nextCursor` | string
`prevCursor` | string
`hasMore` | boolean
`hasPrev` | boolean
`total` | number

## Example

```typescript
import type { ActivityListResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "items": null,
  "nextCursor": null,
  "prevCursor": null,
  "hasMore": null,
  "hasPrev": null,
  "total": null,
} satisfies ActivityListResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ActivityListResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


