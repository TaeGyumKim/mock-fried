
# Event


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`description` | string
`eventDate` | Date
`startTime` | Date
`endTime` | Date
`duration` | string
`timezone` | string
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { Event } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "description": null,
  "eventDate": null,
  "startTime": null,
  "endTime": null,
  "duration": null,
  "timezone": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies Event

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Event
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


