import {
  invalidParameterError,
  missingParameterError,
} from "../app/utils/error";
import HttpStatusCode from "../constants/httpStatusCode";

export class BaseError extends Error {
  constructor(title, message, httpCode, isOperational) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.title = title;
    this.httpCode = httpCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export class ApplicationError extends BaseError {
  constructor(
    title = "Application Error",
    message = "Internal Server Error",
    httpCode = HttpStatusCode.INTERNAL_SERVER,
    isOperational = true
  ) {
    super(title, message, httpCode, isOperational);
  }
}

export class DatabaseError extends ApplicationError {
  constructor(
    title = "Database Error",
    message = "Database Error",
    httpCode = HttpStatusCode.INTERNAL_SERVER,
    isOperational = true
  ) {
    super(title, message, httpCode, isOperational);
  }
}

export class UserFacingError extends ApplicationError {
  constructor(
    title = "User Error",
    message = "User Error",
    httpCode = HttpStatusCode.BAD_REQUEST,
    isOperational = true
  ) {
    super(title, message, httpCode, isOperational);
  }
}

export class APIError extends BaseError {
  constructor(
    title = "Api Error",
    message = "Internal Server Error",
    httpCode = HttpStatusCode.INTERNAL_SERVER,
    isOperational = true
  ) {
    super(title, message, httpCode, isOperational);
  }
}

export class HTTP400Error extends BaseError {
  constructor(message = "bad request") {
    super("NOT FOUND", message, HttpStatusCode.BAD_REQUEST, true);
  }
}

export class MissingParameterError extends BaseError {
  constructor(parameter) {
    super(
      "Missing Parameter",
      missingParameterError(parameter),
      HttpStatusCode.INTERNAL_SERVER,
      true
    );
  }
}

export class InValidParameterError extends BaseError {
  constructor(parameter) {
    super(
      "Invalid Parameter",
      invalidParameterError(parameter),
      HttpStatusCode.BAD_REQUEST,
      true
    );
  }
}

export class DuplicateError extends APIError {
  constructor(
    title = "Duplicate Error",
    message = "You inserted data that already exist"
  ) {
    super(title, message);
  }
}
