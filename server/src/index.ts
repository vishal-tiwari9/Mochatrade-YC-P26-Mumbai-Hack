import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { appContext } from './services/appContext.js';
import { clusterRouter } from './routes/clusterRoutes.js';
import { transactionRouter } from './routes/transactionRoutes.js';
import { systemRouter } from './routes/systemRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

// Basic Rate Limiter for API security (300 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this client, please try again later.'
  }
});

app.use(limiter);
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    module: 'FraudNexus Feature 4: Coordinated Fraud Cluster Detection',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/fraud-clusters', clusterRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/data', transactionRouter);
app.use('/api/data-source', systemRouter);
app.use('/api/system', systemRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

async function startServer() {
  try {
    console.log('[Server] Initializing FraudNexus Detection Engine...');
    await appContext.init();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 FraudNexus Feature 4 Engine running on port ${PORT}`);
      console.log(`📊 Mode: DATA_SOURCE=${process.env.DATA_SOURCE || 'demo'}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/fraud-clusters`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
