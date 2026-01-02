# ActivitiesApi

All URIs are relative to */mock*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getActivity**](ActivitiesApi.md#getactivity) | **GET** /activities/{id} | Get activity by ID |
| [**listActivities**](ActivitiesApi.md#listactivities) | **GET** /activities | List activities (bidirectional cursor pagination) |



## getActivity

> Activity getActivity(id)

Get activity by ID

### Example

```ts
import {
  Configuration,
  ActivitiesApi,
} from '';
import type { GetActivityRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ActivitiesApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetActivityRequest;

  try {
    const data = await api.getActivity(body);
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

[**Activity**](Activity.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Activity details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listActivities

> ActivityListResponse listActivities(cursor, limit, userId)

List activities (bidirectional cursor pagination)

### Example

```ts
import {
  Configuration,
  ActivitiesApi,
} from '';
import type { ListActivitiesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ActivitiesApi();

  const body = {
    // string (optional)
    cursor: cursor_example,
    // number (optional)
    limit: 56,
    // string (optional)
    userId: userId_example,
  } satisfies ListActivitiesRequest;

  try {
    const data = await api.listActivities(body);
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
| **cursor** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `20`] |
| **userId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**ActivityListResponse**](ActivityListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of activities with bidirectional cursors |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

