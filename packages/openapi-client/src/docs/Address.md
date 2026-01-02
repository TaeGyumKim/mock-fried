
# Address


## Properties

Name | Type
------------ | -------------
`street` | string
`city` | string
`state` | string
`country` | string
`zipCode` | string
`coordinates` | [Coordinates](Coordinates.md)

## Example

```typescript
import type { Address } from ''

// TODO: Update the object below with actual values
const example = {
  "street": null,
  "city": null,
  "state": null,
  "country": null,
  "zipCode": null,
  "coordinates": null,
} satisfies Address

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Address
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


