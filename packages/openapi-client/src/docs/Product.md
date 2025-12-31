
# Product


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`description` | string
`price` | number
`currency` | string
`category` | string
`imageUrl` | string
`inStock` | boolean
`stockCount` | number
`variants` | [Array&lt;ProductVariant&gt;](ProductVariant.md)
`createdAt` | Date

## Example

```typescript
import type { Product } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "description": null,
  "price": null,
  "currency": null,
  "category": null,
  "imageUrl": null,
  "inStock": null,
  "stockCount": null,
  "variants": null,
  "createdAt": null,
} satisfies Product

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Product
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


