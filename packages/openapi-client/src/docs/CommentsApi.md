# CommentsApi

All URIs are relative to */mock*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createComment**](CommentsApi.md#createcommentoperation) | **POST** /posts/{postId}/comments | Create a comment on a post |
| [**getComments**](CommentsApi.md#getcomments) | **GET** /posts/{postId}/comments | Get comments for a post |



## createComment

> Comment createComment(postId, createCommentRequest)

Create a comment on a post

### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '';
import type { CreateCommentOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new CommentsApi();

  const body = {
    // string
    postId: postId_example,
    // CreateCommentRequest
    createCommentRequest: ...,
  } satisfies CreateCommentOperationRequest;

  try {
    const data = await api.createComment(body);
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
| **postId** | `string` |  | [Defaults to `undefined`] |
| **createCommentRequest** | [CreateCommentRequest](CreateCommentRequest.md) |  | |

### Return type

[**Comment**](Comment.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Created comment |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getComments

> CommentListResponse getComments(postId, limit)

Get comments for a post

### Example

```ts
import {
  Configuration,
  CommentsApi,
} from '';
import type { GetCommentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new CommentsApi();

  const body = {
    // string
    postId: postId_example,
    // number (optional)
    limit: 56,
  } satisfies GetCommentsRequest;

  try {
    const data = await api.getComments(body);
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
| **postId** | `string` |  | [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `20`] |

### Return type

[**CommentListResponse**](CommentListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of comments |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

