import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { AdapterFactory } from './adapters/AdapterFactory';
import { TransactionGraph } from './graph/TransactionGraph';
import { TraceEngine } from './engine/TraceEngine';
import { SimulationService } from './simulation/SimulationService';
import { createApiRouter } from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

async function bootstrap() {
  try {
    console.log('[FraudNexus Server] Initializing Data Adapter...');
    const adapter = await AdapterFactory.getAdapter();

    console.log(`[FraudNexus Server] Active adapter: ${adapter.adapterName}`);
    const [accounts, transactions, upis, beneficiaries, incidents] = await Promise.all([
      adapter.getAccounts(),
      adapter.getTransactions(),
      adapter.getUpiEntities(),
      adapter.getBeneficiaries(),
      adapter.getFraudIncidents()
    ]);

    console.log(`[FraudNexus Server] Loaded ${accounts.length} accounts, ${transactions.length} transactions, ${upis.length} UPI entities, ${beneficiaries.length} beneficiaries.`);

    const graph = new TransactionGraph(accounts, transactions, upis, beneficiaries, incidents);
    const traceEngine = new TraceEngine(graph, adapter);
    const simulationService = new SimulationService(adapter, graph, traceEngine);

    // Mount API Routes
    const apiRouter = createApiRouter(adapter, graph, traceEngine, simulationService);
    app.use('/api', apiRouter);

    // Serve Frontend Client Static Assets
    const clientDistPath = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(clientDistPath));

    // Handle /money-flow, /money-flow/:transactionId and root fallback
    app.get(['/', '/money-flow', '/money-flow/*'], (req, res) => {
      const indexPath = path.join(clientDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.send('FraudNexus Feature 6 Server running. Build client or use Vite dev server.');
      }
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'UP',
        service: 'FraudNexus Feature 6 - Money Flow / Attack Path Investigation Engine',
        timestamp: new Date().toISOString()
      });
    });

    app.listen(PORT, () => {
      console.log(`🚀 [FraudNexus Server] Running at http://localhost:${PORT}`);
      console.log(`📡 [API Health] http://localhost:${PORT}/health`);
      console.log(`🔍 [Trace API] http://localhost:${PORT}/api/money-flow/trace?source=TXN-FNX-9001`);
    });
  } catch (err) {
    console.error('[FraudNexus Server] Bootstrap Failed:', err);
    process.exit(1);
  }
}

bootstrap();
