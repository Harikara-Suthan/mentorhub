import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ZodError } from "zod";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Always set Content-Type to application/json
  res.setHeader("Content-Type", "application/json");

  // Handle Validation Errors (Zod)
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      message: "Validation failed",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  // Handle Operational Errors (ApiError)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ 
      success: false, 
      error: err.message, 
      message: err.message,
      details: err.details 
    });
  }

  // Handle Prisma Initialization Errors
  if (err?.constructor?.name === "PrismaClientInitializationError") {
    console.error("Database initialization error:", err);
    return res.status(503).json({
      success: false,
      error: "Database service is currently unavailable",
      message: "Database service is currently unavailable",
    });
  }

  // Handle Prisma Known Request Errors
  if (err?.constructor?.name === "PrismaClientKnownRequestError") {
    console.error("Prisma known request error:", {
      code: err.code,
      message: err.message,
      meta: err.meta,
    });
    return res.status(400).json({
      success: false,
      error: "Database operation failed",
      message: "Database operation failed: " + err.message,
      details: err.message,
    });
  }

  // Handle Generic Uncaught Errors
  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    error: "Internal server error",
    message: "Internal server error",
  });
}
