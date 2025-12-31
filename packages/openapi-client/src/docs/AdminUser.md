
# AdminUser


## Properties

Name | Type
------------ | -------------
`id` | string
`username` | string
`email` | string
`name` | string
`avatarUrl` | string
`role` | string
`status` | string
`createdAt` | Date
`updatedAt` | Date
`permissions` | Array&lt;string&gt;
`lastLoginIp` | string
`loginCount` | number
`isSuperAdmin` | boolean

## Example

```typescript
import type { AdminUser } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "username": null,
  "email": null,
  "name": null,
  "avatarUrl": null,
  "role": null,
  "status": null,
  "createdAt": null,
  "updatedAt": null,
  "permissions": null,
  "lastLoginIp": null,
  "loginCount": null,
  "isSuperAdmin": null,
} satisfies AdminUser

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AdminUser
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


