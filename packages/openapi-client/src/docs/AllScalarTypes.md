
# AllScalarTypes


## Properties

Name | Type
------------ | -------------
`doubleVal` | number
`floatVal` | number
`int32Val` | number
`int64Val` | number
`uint32Val` | number
`uint64Val` | number
`sint32Val` | number
`sint64Val` | number
`fixed32Val` | number
`fixed64Val` | number
`sfixed32Val` | number
`sfixed64Val` | number
`boolVal` | boolean
`stringVal` | string
`bytesVal` | string

## Example

```typescript
import type { AllScalarTypes } from ''

// TODO: Update the object below with actual values
const example = {
  "doubleVal": null,
  "floatVal": null,
  "int32Val": null,
  "int64Val": null,
  "uint32Val": null,
  "uint64Val": null,
  "sint32Val": null,
  "sint64Val": null,
  "fixed32Val": null,
  "fixed64Val": null,
  "sfixed32Val": null,
  "sfixed64Val": null,
  "boolVal": null,
  "stringVal": null,
  "bytesVal": null,
} satisfies AllScalarTypes

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AllScalarTypes
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


