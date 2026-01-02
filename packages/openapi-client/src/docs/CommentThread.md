
# CommentThread


## Properties

Name | Type
------------ | -------------
`id` | string
`content` | string
`author` | string
`createdAt` | Date
`likes` | number
`replies` | [Array&lt;CommentThread&gt;](CommentThread.md)

## Example

```typescript
import type { CommentThread } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "content": null,
  "author": null,
  "createdAt": null,
  "likes": null,
  "replies": null,
} satisfies CommentThread

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CommentThread
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


