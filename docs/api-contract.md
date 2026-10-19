# FindSpace API Contract

## 1. Purpose

This document defines the shared rules for the FindSpace API.

It covers the response format, error handling, status codes, and general API rules.

## 2. Response Format

Every API response must use the same top-level structure.

### Success Response

```json
{
  "success": true,
  "data": null,
  "meta": null,
  "error": null
}
```

- `success`: Always `true` for a successful request.
- `data`: The result of the request. It may be an object, an array, or `null`.
- `meta`: Extra information, such as pagination data. Use `null` when not needed.
- `error`: Always `null` for a successful request.

For actions that return no data, such as deleting a resource, `data` is `null`.

### Error Response

```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": null,
    "requestId": "req-123"
  }
}
```

- `success`: Always `false` for a failed request.
- `data`: Always `null` for a failed request.
- `meta`: Always `null` for a failed request.
- `error.code`: A stable error code for the type of error. The frontend uses it to choose localized messages.
- `error.message`: A general error message for API consumers and logs.
- `error.details`: Extra information about the error, such as field validation errors. Use `null` when no extra details exist.
- `error.requestId`: An ID used to find the related request in server logs.

## 3. HTTP Status Codes

Use HTTP status codes to show the result of each request.

| Status | Use |
| --- | --- |
| `200 OK` | Request succeeded. |
| `201 Created` | A resource was created. |
| `204 No Content` | Not used; successful responses follow the shared JSON response format. |
| `400 Bad Request` | The request is invalid. |
| `401 Unauthorized` | Authentication is missing or invalid. |
| `403 Forbidden` | The user is not allowed to perform the action. |
| `404 Not Found` | The requested resource does not exist or cannot be accessed. |
| `409 Conflict` | The request conflicts with the current state, such as a booking slot already being taken. |
| `422 Unprocessable Content` | The request fields fail validation. |
| `429 Too Many Requests` | The client sent too many requests. |
| `500 Internal Server Error` | An unexpected server error occurred. |

Successful responses must include the shared JSON structure, including when `data` is `null`.

## 4. Error Codes

- Error codes must be stable and machine-readable.
- Use uppercase `SNAKE_CASE` names, such as `USER_NOT_FOUND`.
- Do not use the message text as an error code.
- Keep codes independent of the language used in messages.
- Use clear, specific codes for validation, authentication, permissions, missing resources, conflicts, and unexpected errors.

## 5. Validation Errors

- Validate request data on the server.
- Return the shared error response when validation fails.
- Use `error.details` to describe field-level validation problems.
- Keep the details format consistent across endpoints.

## 6. Request IDs and Logging

- Each request must have a request ID.
- Include the request ID in error responses.
- Include it in server logs so an error can be traced.
- Do not expose private system details, stack traces, or secrets in error responses.

## 7. Authentication and Permissions

- Protected endpoints require an authenticated user.
- Role-based access and resource ownership must be checked on the server.
- A user must not access or change resources they do not have permission to use.
- Do not rely on frontend checks as the only access control.

## 8. General Rules

- Use JSON for request and response bodies unless an endpoint needs file upload.
- Use consistent field names and data types.
- Keep error responses consistent across the API.
- Do not return database errors directly to clients.

## 9. Response Helper Functions

Use these helper functions to keep API responses consistent.

- `sendSuccess(res, data)`: Returns a success response with data.
- `sendSuccessWithoutData(res)`: Returns a success response with `data: null`.
- `sendSuccessWithMeta(res, data, meta)`: Returns a success response with data and metadata, such as pagination.
- `sendError(res, error, status)`: Returns an error response with the given HTTP status and message.

All helpers must follow the shared response format defined above. Error responses must include the error code, details, and request ID.
