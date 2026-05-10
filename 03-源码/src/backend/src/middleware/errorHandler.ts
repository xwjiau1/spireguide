import { Request, Response, NextFunction } from 'express';

/**
 * 全局错误处理中间件
 * 统一处理API错误，返回标准化响应
 */

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('API错误:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404处理中间件
 */
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'API接口不存在',
  });
}
