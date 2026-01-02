# AdvancedCasesApi

All URIs are relative to */mock*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getAdvancedOrder**](AdvancedCasesApi.md#getadvancedorder) | **GET** /advanced/orders/{id} | Get order with nested enum |
| [**getAllScalarTypes**](AdvancedCasesApi.md#getallscalartypes) | **GET** /advanced/scalars | Get all scalar types (Proto3 feature testing) |
| [**getCommentThread**](AdvancedCasesApi.md#getcommentthread) | **GET** /advanced/comment-thread/{id} | Get comment thread (recursive) |
| [**getCompany**](AdvancedCasesApi.md#getcompany) | **GET** /advanced/company/{id} | Get company with deep nesting |
| [**getGraph**](AdvancedCasesApi.md#getgraph) | **GET** /advanced/graph/{id} | Get graph node (recursive with edges) |
| [**getOrgChart**](AdvancedCasesApi.md#getorgchart) | **GET** /advanced/org-chart/{id} | Get organization chart (recursive) |
| [**getTreeNode**](AdvancedCasesApi.md#gettreenode) | **GET** /advanced/tree/{id} | Get tree node (recursive structure) |
| [**getUserPreferences**](AdvancedCasesApi.md#getuserpreferences) | **GET** /advanced/preferences | Get user preferences (optional fields) |
| [**listAdvancedOrders**](AdvancedCasesApi.md#listadvancedorders) | **GET** /advanced/orders | List orders with nested enum (page pagination) |
| [**updateUserPreferences**](AdvancedCasesApi.md#updateuserpreferences) | **PUT** /advanced/preferences | Update user preferences |



## getAdvancedOrder

> AdvancedOrder getAdvancedOrder(id)

Get order with nested enum

### Example

```ts
import {
  Configuration,
  AdvancedCasesApi,
} from '';
import type { GetAdvancedOrderRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AdvancedCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetAdvancedOrderRequest;

  try {
    const data = await api.getAdvancedOrder(body);
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

[**AdvancedOrder**](AdvancedOrder.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Advanced order details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAllScalarTypes

> AllScalarTypes getAllScalarTypes()

Get all scalar types (Proto3 feature testing)

### Example

```ts
import {
  Configuration,
  AdvancedCasesApi,
} from '';
import type { GetAllScalarTypesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AdvancedCasesApi();

  try {
    const data = await api.getAllScalarTypes();
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

[**AllScalarTypes**](AllScalarTypes.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | All scalar types |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCommentThread

> CommentThread getCommentThread(id)

Get comment thread (recursive)

### Example

```ts
import {
  Configuration,
  AdvancedCasesApi,
} from '';
import type { GetCommentThreadRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AdvancedCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetCommentThreadRequest;

  try {
    const data = await api.getCommentThread(body);
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

[**CommentThread**](CommentThread.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Comment with nested replies |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCompany

> Company getCompany(id)

Get company with deep nesting

### Example

```ts
import {
  Configuration,
  AdvancedCasesApi,
} from '';
import type { GetCompanyRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AdvancedCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetCompanyRequest;

  try {
    const data = await api.getCompany(body);
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

[**Company**](Company.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Company with nested structure |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getGraph

> GraphNode getGraph(id)

Get graph node (recursive with edges)

### Example

```ts
import {
  Configuration,
  AdvancedCasesApi,
} from '';
import type { GetGraphRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AdvancedCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetGraphRequest;

  try {
    const data = await api.getGraph(body);
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

[**GraphNode**](GraphNode.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Graph node with edges |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getOrgChart

> OrgMember getOrgChart(id)

Get organization chart (recursive)

### Example

```ts
import {
  Configuration,
  AdvancedCasesApi,
} from '';
import type { GetOrgChartRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AdvancedCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetOrgChartRequest;

  try {
    const data = await api.getOrgChart(body);
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

[**OrgMember**](OrgMember.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Organization member with reports |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getTreeNode

> TreeNode getTreeNode(id)

Get tree node (recursive structure)

### Example

```ts
import {
  Configuration,
  AdvancedCasesApi,
} from '';
import type { GetTreeNodeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AdvancedCasesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetTreeNodeRequest;

  try {
    const data = await api.getTreeNode(body);
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

[**TreeNode**](TreeNode.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Tree node with children |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUserPreferences

> UserPreferences getUserPreferences()

Get user preferences (optional fields)

### Example

```ts
import {
  Configuration,
  AdvancedCasesApi,
} from '';
import type { GetUserPreferencesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AdvancedCasesApi();

  try {
    const data = await api.getUserPreferences();
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

[**UserPreferences**](UserPreferences.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | User preferences |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listAdvancedOrders

> AdvancedOrderListResponse listAdvancedOrders(page, limit)

List orders with nested enum (page pagination)

### Example

```ts
import {
  Configuration,
  AdvancedCasesApi,
} from '';
import type { ListAdvancedOrdersRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AdvancedCasesApi();

  const body = {
    // number (optional)
    page: 56,
    // number (optional)
    limit: 56,
  } satisfies ListAdvancedOrdersRequest;

  try {
    const data = await api.listAdvancedOrders(body);
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
| **page** | `number` |  | [Optional] [Defaults to `1`] |
| **limit** | `number` |  | [Optional] [Defaults to `20`] |

### Return type

[**AdvancedOrderListResponse**](AdvancedOrderListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of advanced orders |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateUserPreferences

> UserPreferences updateUserPreferences(userPreferences)

Update user preferences

### Example

```ts
import {
  Configuration,
  AdvancedCasesApi,
} from '';
import type { UpdateUserPreferencesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AdvancedCasesApi();

  const body = {
    // UserPreferences
    userPreferences: ...,
  } satisfies UpdateUserPreferencesRequest;

  try {
    const data = await api.updateUserPreferences(body);
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
| **userPreferences** | [UserPreferences](UserPreferences.md) |  | |

### Return type

[**UserPreferences**](UserPreferences.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Updated preferences |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

