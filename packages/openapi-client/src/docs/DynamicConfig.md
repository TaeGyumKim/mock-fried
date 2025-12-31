
# DynamicConfig


## Properties

Name | Type
------------ | -------------
`version` | string
`environment` | string

## Example

```typescript
import type { DynamicConfig } from ''

// TODO: Update the object below with actual values
const example = {
  "version": null,
  "environment": null,
} satisfies DynamicConfig

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DynamicConfig
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


