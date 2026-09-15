import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { Role } from "../config/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing or invalid Authorization header"));
  }
  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(ApiError.unauthorized("Session expired or invalid. Please log in again."));
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    // ADMIN is the highest application role and has access to all standard modules
    if (req.user.role === Role.ADMIN) {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("Your role does not allow this action."));
    }
    next();
  };
}
