
# CategoryNode


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`description` | string
`parentId` | string
`children` | [Array&lt;CategoryNode&gt;](CategoryNode.md)
`productCount` | number

## Example

```typescript
import type { CategoryNode } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "description": null,
  "parentId": null,
  "children": null,
  "productCount": null,
} satisfies CategoryNode

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CategoryNode
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


