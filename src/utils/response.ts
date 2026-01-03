import { Response } from 'express';
import { ApiResponse, PaginationInfo } from '../types';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200,
    pagination?: PaginationInfo
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
      ...(pagination && { pagination }),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data?: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response, message?: string): Response {
    const response: ApiResponse = {
      success: true,
      ...(message && { message }),
    };

    return res.status(204).json(response);
  }
}

export const sendSuccess = ResponseUtil.success;
export const sendCreated = ResponseUtil.created;
export const sendNoContent = ResponseUtil.noContent;
