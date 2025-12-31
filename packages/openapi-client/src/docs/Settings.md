
# Settings


## Properties

Name | Type
------------ | -------------
`displayName` | string
`volume` | number
`brightness` | number
`favoriteColors` | Array&lt;string&gt;
`phoneNumber` | string
`theme` | string
`language` | string
`notificationsEnabled` | boolean

## Example

```typescript
import type { Settings } from ''

// TODO: Update the object below with actual values
const example = {
  "displayName": null,
  "volume": null,
  "brightness": null,
  "favoriteColors": null,
  "phoneNumber": null,
  "theme": null,
  "language": null,
  "notificationsEnabled": null,
} satisfies Settings

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Settings
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


