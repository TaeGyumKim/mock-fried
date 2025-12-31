# PostsApi

All URIs are relative to */mock*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createPost**](PostsApi.md#createpostoperation) | **POST** /posts | Create a new post |
| [**getPostById**](PostsApi.md#getpostbyid) | **GET** /posts/{id} | Get post by ID |
| [**getPosts**](PostsApi.md#getposts) | **GET** /posts | List posts with cursor pagination |



## createPost

> Post createPost(createPostRequest)

Create a new post

### Example

```ts
import {
  Configuration,
  PostsApi,
} from '';
import type { CreatePostOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PostsApi();

  const body = {
    // CreatePostRequest
    createPostRequest: ...,
  } satisfies CreatePostOperationRequest;

  try {
    const data = await api.createPost(body);
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
| **createPostRequest** | [CreatePostRequest](CreatePostRequest.md) |  | |

### Return type

[**Post**](Post.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Created post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPostById

> Post getPostById(id)

Get post by ID

### Example

```ts
import {
  Configuration,
  PostsApi,
} from '';
import type { GetPostByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PostsApi();

  const body = {
    // string
    id: id_example,
  } satisfies GetPostByIdRequest;

  try {
    const data = await api.getPostById(body);
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

[**Post**](Post.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Post details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getPosts

> PostListResponse getPosts(cursor, limit, authorId)

List posts with cursor pagination

### Example

```ts
import {
  Configuration,
  PostsApi,
} from '';
import type { GetPostsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PostsApi();

  const body = {
    // string | Cursor for pagination (optional)
    cursor: cursor_example,
    // number (optional)
    limit: 56,
    // string (optional)
    authorId: authorId_example,
  } satisfies GetPostsRequest;

  try {
    const data = await api.getPosts(body);
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
| **cursor** | `string` | Cursor for pagination | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `20`] |
| **authorId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**PostListResponse**](PostListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of posts with cursor |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

