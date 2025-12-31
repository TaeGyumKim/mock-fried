# EdgeCasesApi

All URIs are relative to */mock*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**clearCache**](EdgeCasesApi.md#clearcache) | **DELETE** /cache | Clear cache (204 No Content) |
| [**deleteSession**](EdgeCasesApi.md#deletesession) | **DELETE** /sessions/{id} | Delete session (204 No Content) |
| [**getAdminUser**](EdgeCasesApi.md#getadminuser) | **GET** /admin/users/{id} | Get user with admin details (allOf composition) |
| [**getCategoryProduct**](EdgeCasesApi.md#getcategoryproduct) | **GET** /categories/{categoryId}/products/{productId} | Get product within category |
| [**getCategoryTree**](EdgeCasesApi.md#getcategorytree) | **GET** /categories/{id}/tree | Get category tree (recursive structure) |
| [**getConfig**](EdgeCasesApi.md#getconfig) | **GET** /config | Get configuration (additionalProperties) |
| [**getEvent**](EdgeCasesApi.md#getevent) | **GET** /events/{id} | Get event with various date formats |
| [**getFeaturedProducts**](EdgeCasesApi.md#getfeaturedproducts) | **GET** /featured/products | Get featured products (direct array) |
| [**getMetrics**](EdgeCasesApi.md#getmetrics) | **GET** /analytics/metrics | Get metrics with various numeric types |
| [**getNotification**](EdgeCasesApi.md#getnotification) | **GET** /notifications/{id} | Get notification (oneOf different types) |
| [**getOrderItem**](EdgeCasesApi.md#getorderitem) | **GET** /users/{userId}/orders/{orderId}/items/{itemId} | Get specific item in user\&#39;s order (3 path params) |
| [**getProfile**](EdgeCasesApi.md#getprofile) | **GET** /profiles/{id} | Get user profile with nullable fields |
| [**getReport**](EdgeCasesApi.md#getreport) | **GET** /reports/{id} | Get detailed report with nested structure |
| [**getSearchSuggestions**](EdgeCasesApi.md#getsearchsuggestions) | **GET** /search/suggestions | Get search suggestions (string array) |
| [**getSettings**](EdgeCasesApi.md#getsettings) | **GET** /settings | Get settings with min/max constraints |
| [**getSystemStatus**](EdgeCasesApi.md#getsystemstatus) | **GET** /stats/status | Get system status (string response) |
| [**getTotalCount**](EdgeCasesApi.md#gettotalcount) | **GET** /stats/count | Get total item count (number response) |
| [**isFeatureEnabled**](EdgeCasesApi.md#isfeatureenabled) | **GET** /stats/enabled | Check if feature is enabled (boolean response) |
| [**updateSettings**](EdgeCasesApi.md#updatesettings) | **PUT** /settings | Update settings |



## clearCache

> clearCache()

Clear cache (204 No Content)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { ClearCacheRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  try {
    const data = await api.clearCache();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Cache cleared |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteSession

> deleteSession(id)

Delete session (204 No Content)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { DeleteSessionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies DeleteSessionRequest;

  try {
    const data = await api.deleteSession(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Session deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAdminUser

> AdminUser getAdminUser(id)

Get user with admin details (allOf composition)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetAdminUserRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetAdminUserRequest;

  try {
    const data = await api.getAdminUser(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**AdminUser**](AdminUser.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Admin user details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCategoryProduct

> Product getCategoryProduct(categoryId, productId)

Get product within category

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetCategoryProductRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  const body = {
    // string
    categoryId: categoryId_example,
    // string
    productId: productId_example,
  } satisfies GetCategoryProductRequest;

  try {
    const data = await api.getCategoryProduct(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **categoryId** | `string` |  | [Defaults to `undefined`] |
| **productId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**Product**](Product.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Product in category |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCategoryTree

> CategoryNode getCategoryTree(id)

Get category tree (recursive structure)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetCategoryTreeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetCategoryTreeRequest;

  try {
    const data = await api.getCategoryTree(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**CategoryNode**](CategoryNode.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Category with children (recursive) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getConfig

> { [key: string]: string; } getConfig()

Get configuration (additionalProperties)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetConfigRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  try {
    const data = await api.getConfig();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**{ [key: string]: string; }**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Configuration map |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getEvent

> Event getEvent(id)

Get event with various date formats

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetEventRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetEventRequest;

  try {
    const data = await api.getEvent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**Event**](Event.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Event details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getFeaturedProducts

> Array&lt;Product&gt; getFeaturedProducts()

Get featured products (direct array)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetFeaturedProductsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  try {
    const data = await api.getFeaturedProducts();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;Product&gt;**](Product.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Array of products without pagination |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getMetrics

> Metrics getMetrics()

Get metrics with various numeric types

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetMetricsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  try {
    const data = await api.getMetrics();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Metrics**](Metrics.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Metrics data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getNotification

> Notification getNotification(id)

Get notification (oneOf different types)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetNotificationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetNotificationRequest;

  try {
    const data = await api.getNotification(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**Notification**](Notification.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Notification (can be different types) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getOrderItem

> OrderItem getOrderItem(userId, orderId, itemId)

Get specific item in user\&#39;s order (3 path params)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetOrderItemRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  const body = {
    // string
    userId: userId_example,
    // string
    orderId: orderId_example,
    // string
    itemId: itemId_example,
  } satisfies GetOrderItemRequest;

  try {
    const data = await api.getOrderItem(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **userId** | `string` |  | [Defaults to `undefined`] |
| **orderId** | `string` |  | [Defaults to `undefined`] |
| **itemId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**OrderItem**](OrderItem.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Order item |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProfile

> UserProfile getProfile(id)

Get user profile with nullable fields

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetProfileRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetProfileRequest;

  try {
    const data = await api.getProfile(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**UserProfile**](UserProfile.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | User profile |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getReport

> Report getReport(id)

Get detailed report with nested structure

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetReportRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetReportRequest;

  try {
    const data = await api.getReport(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**Report**](Report.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Report with nested data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSearchSuggestions

> Array&lt;string&gt; getSearchSuggestions(q)

Get search suggestions (string array)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetSearchSuggestionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  const body = {
    // string
    q: q_example,
  } satisfies GetSearchSuggestionsRequest;

  try {
    const data = await api.getSearchSuggestions(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **q** | `string` |  | [Defaults to `undefined`] |

### Return type

**Array<string>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Array of suggestion strings |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSettings

> Settings getSettings()

Get settings with min/max constraints

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  try {
    const data = await api.getSettings();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Settings**](Settings.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Settings with constraints |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSystemStatus

> string getSystemStatus()

Get system status (string response)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetSystemStatusRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  try {
    const data = await api.getSystemStatus();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Status string |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTotalCount

> number getTotalCount()

Get total item count (number response)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { GetTotalCountRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  try {
    const data = await api.getTotalCount();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**number**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Total count as number |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## isFeatureEnabled

> boolean isFeatureEnabled()

Check if feature is enabled (boolean response)

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { IsFeatureEnabledRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  try {
    const data = await api.isFeatureEnabled();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**boolean**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Boolean flag |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateSettings

> Settings updateSettings(settings)

Update settings

### Example

```ts
import {
  Configuration,
  EdgeCasesApi,
} from '';
import type { UpdateSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new EdgeCasesApi();

  const body = {
    // Settings
    settings: ...,
  } satisfies UpdateSettingsRequest;

  try {
    const data = await api.updateSettings(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **settings** | [Settings](Settings.md) |  | |

### Return type

[**Settings**](Settings.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Updated settings |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

