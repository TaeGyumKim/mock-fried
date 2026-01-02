
# GraphNode


## Properties

Name | Type
------------ | -------------
`id` | string
`label` | string
`weight` | number
`metadata` | { [key: string]: string; }
`edges` | [Array&lt;GraphEdge&gt;](GraphEdge.md)

## Example

```typescript
import type { GraphNode } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "label": null,
  "weight": null,
  "metadata": null,
  "edges": null,
} satisfies GraphNode

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GraphNode
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


