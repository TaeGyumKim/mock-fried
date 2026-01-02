
# NotificationSettings


## Properties

Name | Type
------------ | -------------
`email` | boolean
`push` | boolean
`sms` | boolean
`frequency` | string

## Example

```typescript
import type { NotificationSettings } from ''

// TODO: Update the object below with actual values
const example = {
  "email": null,
  "push": null,
  "sms": null,
  "frequency": null,
} satisfies NotificationSettings

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NotificationSettings
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


