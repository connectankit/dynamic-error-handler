import AppError from "./AppError.js";
import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

interface ErrorType extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number;
  errors?: any;
  path?: string;
  value?: string;
}

type HandlerFunction = (err: any) => AppError;

interface Handlers {
  [key: string]: HandlerFunction;
}

interface ErrorHandlerOptions {
  enableLogging?: boolean;
  customHandlers?: Handlers;
}

const defaultHandlers: Handlers = {
  CastError: (err: ErrorType) =>
    new AppError(`Invalid ${err.path}: ${err.value}.`, 400),

  ValidationError: (err: any) => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    return new AppError(`Invalid input data. ${errors.join(". ")}`, 400);
  },

  DuplicateField: (err: any) => {
    const value = JSON.stringify(err.keyValue);
    return new AppError(`Duplicate field value: ${value}`, 400);
  },

  JsonWebTokenError: () =>
    new AppError("Invalid token. Please log in again.", 401),

  TokenExpiredError: () =>
    new AppError("Token expired. Please log in again.", 401),
};

const logError = (err: ErrorType, req: Request) => {
  const log = `
[${new Date().toISOString()}]
URL: ${req.originalUrl}
Method: ${req.method}
IP: ${req.ip}
Message: ${err.message}
Stack: ${err.stack}
`;
  const logPath = path.resolve("logs", "error.log");
  if (!fs.existsSync("logs")) fs.mkdirSync("logs");
  fs.appendFileSync(logPath, log);
};

const sendDevError = (err: ErrorType, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    stack: err.stack,
  });
};

const sendProdError = (err: ErrorType, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode!).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

// The exported factory function accepts options (enableLogging + customHandlers)
export default ({
  enableLogging = true,
  customHandlers = {},
}: ErrorHandlerOptions = {}) => {
  // Merge default handlers and custom handlers
  const handlers = { ...defaultHandlers, ...customHandlers };

  return (err: ErrorType, req: Request, res: Response, next: NextFunction) => {
    if (enableLogging) {
      logError(err, req);
    }

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (err.code === 11000) err = handlers.DuplicateField(err);
    if (handlers[err.name as keyof typeof handlers]) {
      err = handlers[err.name as keyof typeof handlers](err);
    }

    if (process.env.NODE_ENV === "development") {
      sendDevError(err, res);
    } else {
      sendProdError(err, res);
    }
  };
};
