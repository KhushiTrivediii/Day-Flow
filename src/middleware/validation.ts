import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './errorHandler';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: any[] = [];

    // Validate body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(
          ...error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            code: detail.type,
          }))
        );
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(
          ...error.details.map(detail => ({
            field: `query.${detail.path.join('.')}`,
            message: detail.message,
            code: detail.type,
          }))
        );
      }
    }

    // Validate path parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push(
          ...error.details.map(detail => ({
            field: `params.${detail.path.join('.')}`,
            message: detail.message,
            code: detail.type,
          }))
        );
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', errors));
    }

    next();
  };
};

/**
 * Enhanced input sanitization middleware
 */
export const sanitizeInput = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Basic input sanitization
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Trim whitespace and remove null bytes
      let sanitized = obj.trim().replace(/\0/g, '');

      // Basic XSS prevention - remove script tags and javascript: protocols
      sanitized = sanitized.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ''
      );
      sanitized = sanitized.replace(/javascript:/gi, '');
      sanitized = sanitized.replace(/on\w+\s*=/gi, '');

      return sanitized;
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // Sanitize keys as well
          const sanitizedKey = typeof key === 'string' ? key.trim() : key;
          sanitized[sanitizedKey] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Ensure reasonable limits
  req.query.page = Math.max(1, page).toString();
  req.query.limit = Math.min(Math.max(1, limit), 100).toString(); // Max 100 items per page

  next();
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  id: Joi.object({
    id: Joi.string().required(),
  }),

  loginCredentials: Joi.object({
    loginId: Joi.string().required().trim(),
    password: Joi.string().required().min(1),
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(8).max(128),
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  confirmResetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().required().min(8).max(128),
  }),
};
