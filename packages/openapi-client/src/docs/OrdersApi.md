# OrdersApi

All URIs are relative to */mock*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createOrder**](OrdersApi.md#createorderoperation) | **POST** /orders | Create a new order |
| [**getOrderById**](OrdersApi.md#getorderbyid) | **GET** /orders/{id} | Get order by ID |
| [**getOrders**](OrdersApi.md#getorders) | **GET** /orders | List all orders |



## createOrder

> Order createOrder(createOrderRequest)

Create a new order

### Example

```ts
import {
  Configuration,
  OrdersApi,
} from '';
import type { CreateOrderOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new OrdersApi();

  const body = {
    // CreateOrderRequest
    createOrderRequest: ...,
  } satisfies CreateOrderOperationRequest;

  try {
    const data = await api.createOrder(body);
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
| **createOrderRequest** | [CreateOrderRequest](CreateOrderRequest.md) |  | |

### Return type

[**Order**](Order.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Created order |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getOrderById

> Order getOrderById(id)

Get order by ID

### Example

```ts
import {
  Configuration,
  OrdersApi,
} from '';
import type { GetOrderByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new OrdersApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetOrderByIdRequest;

  try {
    const data = await api.getOrderById(body);
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

[**Order**](Order.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Order details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getOrders

> OrderListResponse getOrders(page, limit, status, userId)

List all orders

### Example

```ts
import {
  Configuration,
  OrdersApi,
} from '';
import type { GetOrdersRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new OrdersApi();

  const body = {
    // number (optional)
    page: 56,
    // number (optional)
    limit: 56,
    // 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' (optional)
    status: status_example,
    // string (optional)
    userId: userId_example,
  } satisfies GetOrdersRequest;

  try {
    const data = await api.getOrders(body);
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
| **status** | `pending`, `processing`, `shipped`, `delivered`, `cancelled` |  | [Optional] [Defaults to `undefined`] [Enum: pending, processing, shipped, delivered, cancelled] |
| **userId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**OrderListResponse**](OrderListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of orders |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

