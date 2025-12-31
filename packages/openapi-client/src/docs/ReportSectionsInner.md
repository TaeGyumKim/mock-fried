
# ReportSectionsInner


## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`content` | string
`subsections` | [Array&lt;ReportSectionsInnerSubsectionsInner&gt;](ReportSectionsInnerSubsectionsInner.md)

## Example

```typescript
import type { ReportSectionsInner } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "title": null,
  "content": null,
  "subsections": null,
} satisfies ReportSectionsInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportSectionsInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


