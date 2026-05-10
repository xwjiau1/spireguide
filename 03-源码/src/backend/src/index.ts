import express from 'express';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';

import cardsRouter from './routes/cards';
import enemiesRouter from './routes/enemies';
import relicsRouter from './routes/relics';
import aiRouter from './routes/ai';
import sessionsRouter from './routes/sessions';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * SpireGuide 后端服务入口
 * Express + SQLite + TypeScript
 */

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每IP最多100次
  message: { success: false, error: '请求过于频繁，请稍后再试' },
});
app.use('/api/', limiter);

// AI接口单独限流（更严格）
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 30, // 每小时30次
  message: { success: false, error: 'AI问答次数已达上限，请稍后再试' },
});
app.use('/api/ai/', aiLimiter);

// API路由
app.use('/api/cards', cardsRouter);
app.use('/api/enemies', enemiesRouter);
app.use('/api/relics', relicsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/sessions', sessionsRouter);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', version: '0.1.0' } });
});

// 静态文件（前端构建产物）
import fs from 'fs';
const possibleStaticPaths = [
  path.join(__dirname, '../public'),     // dev: src/backend/src → src/backend/public
  path.join(__dirname, 'public'),        // prod: dist → dist/public
  path.join(__dirname, '../../public'),  // fallback
];
const staticPath = possibleStaticPaths.find(p => fs.existsSync(p)) || possibleStaticPaths[0];
app.use(express.static(staticPath));

// 所有非API请求返回前端index.html（SPA支持）
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return notFoundHandler(req, res);
  }
  res.sendFile(path.join(staticPath, 'index.html'));
});

// 错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SpireGuide 后端服务运行在端口 ${PORT}`);
  console.log(`API地址: http://localhost:${PORT}/api`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
});
