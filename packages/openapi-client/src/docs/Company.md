
# Company


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`address` | [Address](Address.md)
`departments` | [Array&lt;Department&gt;](Department.md)
`metadata` | { [key: string]: string; }

## Example

```typescript
import type { Company } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "address": null,
  "departments": null,
  "metadata": null,
} satisfies Company

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Company
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


