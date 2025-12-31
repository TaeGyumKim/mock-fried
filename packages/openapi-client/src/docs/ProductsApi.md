# ProductsApi

All URIs are relative to */mock*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createProduct**](ProductsApi.md#createproductoperation) | **POST** /products | Create a new product |
| [**getProductById**](ProductsApi.md#getproductbyid) | **GET** /products/{id} | Get product by ID |
| [**getProducts**](ProductsApi.md#getproducts) | **GET** /products | List all products |



## createProduct

> Product createProduct(createProductRequest)

Create a new product

### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '';
import type { CreateProductOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ProductsApi();

  const body = {
    // CreateProductRequest
    createProductRequest: ...,
  } satisfies CreateProductOperationRequest;

  try {
    const data = await api.createProduct(body);
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
| **createProductRequest** | [CreateProductRequest](CreateProductRequest.md) |  | |

### Return type

[**Product**](Product.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Created product |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProductById

> Product getProductById(id)

Get product by ID

### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '';
import type { GetProductByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ProductsApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetProductByIdRequest;

  try {
    const data = await api.getProductById(body);
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

[**Product**](Product.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Product details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getProducts

> ProductListResponse getProducts(page, limit, category, minPrice, maxPrice)

List all products

### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '';
import type { GetProductsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ProductsApi();

  const body = {
    // number (optional)
    page: 56,
    // number (optional)
    limit: 56,
    // 'electronics' | 'clothing' | 'food' | 'books' | 'other' (optional)
    category: category_example,
    // number (optional)
    minPrice: 8.14,
    // number (optional)
    maxPrice: 8.14,
  } satisfies GetProductsRequest;

  try {
    const data = await api.getProducts(body);
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
| **category** | `electronics`, `clothing`, `food`, `books`, `other` |  | [Optional] [Defaults to `undefined`] [Enum: electronics, clothing, food, books, other] |
| **minPrice** | `number` |  | [Optional] [Defaults to `undefined`] |
| **maxPrice** | `number` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**ProductListResponse**](ProductListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of products |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

