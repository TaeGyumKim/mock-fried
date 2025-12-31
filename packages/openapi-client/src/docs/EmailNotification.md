
# EmailNotification


## Properties

Name | Type
------------ | -------------
`id` | string
`type` | string
`subject` | string
`body` | string
`recipientEmail` | string
`sentAt` | Date

## Example

```typescript
import type { EmailNotification } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "type": null,
  "subject": null,
  "body": null,
  "recipientEmail": null,
  "sentAt": null,
} satisfies EmailNotification

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EmailNotification
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


