import { PaginationOptions, PaginatedResponse, PaginationInfo } from '../types';

export class PaginationUtil {
  static validateOptions(
    options: Partial<PaginationOptions>
  ): PaginationOptions {
    const page = Math.max(1, parseInt(String(options.page || 1), 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(options.limit || 10), 10))
    );

    return {
      page,
      limit,
      sortBy: options.sortBy || 'createdAt',
      sortOrder: options.sortOrder === 'asc' ? 'asc' : 'desc',
    };
  }

  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static createPaginationInfo(
    page: number,
    limit: number,
    total: number
  ): PaginationInfo {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static createResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResponse<T> {
    return {
      data,
      pagination: this.createPaginationInfo(page, limit, total),
    };
  }
}
