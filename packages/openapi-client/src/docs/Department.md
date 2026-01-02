
# Department


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`headCount` | number
`manager` | [Employee](Employee.md)
`subDepartments` | [Array&lt;Department&gt;](Department.md)

## Example

```typescript
import type { Department } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "headCount": null,
  "manager": null,
  "subDepartments": null,
} satisfies Department

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Department
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


