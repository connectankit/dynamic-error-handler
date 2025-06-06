# Dynamic Error Handler

A clean, modular, and dynamic Express error handler middleware with centralized logging and custom error class — written in TypeScript. Handles common errors like CastError, ValidationError, MongoDB duplicates, JWT errors, and more.

---

## Features

- ✅ Custom `AppError` class for operational errors
- ✅ Dynamic error handler middleware with extensible error handling
- ✅ `catchAsync` helper to wrap async route handlers and forward errors
- ✅ Centralized error logging to `logs/error.log` (configurable)
- ✅ Clear JSON error responses for both development and production
- ✅ Toggle detailed logging with a simple flag
- ✅ TypeScript-ready

---

## Installation

```bash
npm install dynamic-error-handler
```

---

## Usage

### Basic Setup

```ts
import express from "express";
import {
  AppError,
  createErrorHandler,
  catchAsync,
} from "dynamic-error-handler";

const app = express();

app.get(
  "/test",
  catchAsync(async (req, res, next) => {
    // Simulate an async error
    return next(new AppError("Something went wrong!", 400));
  })
);

// Use the error handler middleware after all routes
app.use(
  createErrorHandler({
    logErrors: true,
    MyCustomError: (err: any) =>
      new AppError(`Custom error: ${err.message}`, 400),
  })
);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

---

## API

### `AppError`

Custom error class extending the built-in `Error` class.

```ts
new AppError(message: string, statusCode?: number)
```

- `message`: Error message string
- `statusCode`: HTTP status code (default: 400)

---

### `catchAsync`

Wrap your async route handlers to automatically catch errors and forward them to the error handler.

```ts
const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
```

---

### `createErrorHandler(options?)`

Express error handling middleware. Use at the end of your middleware stack.

- `options` (optional):

  - `logErrors` (boolean): If `true`, errors are logged to `logs/error.log` and console (default: `false`).

Example:

```ts
app.use(createErrorHandler({ logErrors: true }));
```

---

## Supported Error Types

- `CastError` (Mongoose invalid IDs)
- `ValidationError` (Mongoose validation)
- MongoDB duplicate key errors
- JWT errors (`JsonWebTokenError`, `TokenExpiredError`)
- Other unknown errors are handled gracefully

---

## Logging

- Logs are appended to `logs/error.log` in your project root.
- If `logErrors` option is enabled, errors are printed to console and saved in the log file.
- If disabled, logging is suppressed.

---

## Development & Production Modes

- In **development** mode (`NODE_ENV=development`), full error stack and details are sent in JSON response.
- In **production** mode, only trusted operational errors show details; otherwise, a generic message is sent.

---

## License

MIT © Ankit Kumar

---

## Contribution

Feel free to open issues or submit pull requests!

---

## Acknowledgments

Inspired by best practices in Express error handling and TypeScript utilities.

```

```
