
# PushNotification


## Properties

Name | Type
------------ | -------------
`id` | string
`type` | string
`title` | string
`message` | string
`deviceToken` | string
`badge` | number
`sound` | string

## Example

```typescript
import type { PushNotification } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "type": null,
  "title": null,
  "message": null,
  "deviceToken": null,
  "badge": null,
  "sound": null,
} satisfies PushNotification

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PushNotification
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


