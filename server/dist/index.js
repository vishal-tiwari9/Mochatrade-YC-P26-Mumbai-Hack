"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const AdapterFactory_1 = require("./adapters/AdapterFactory");
const TransactionGraph_1 = require("./graph/TransactionGraph");
const TraceEngine_1 = require("./engine/TraceEngine");
const SimulationService_1 = require("./simulation/SimulationService");
const api_1 = require("./routes/api");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security & Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express_1.default.json());
// Basic Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
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
        const adapter = await AdapterFactory_1.AdapterFactory.getAdapter();
        console.log(`[FraudNexus Server] Active adapter: ${adapter.adapterName}`);
        const [accounts, transactions, upis, beneficiaries, incidents] = await Promise.all([
            adapter.getAccounts(),
            adapter.getTransactions(),
            adapter.getUpiEntities(),
            adapter.getBeneficiaries(),
            adapter.getFraudIncidents()
        ]);
        console.log(`[FraudNexus Server] Loaded ${accounts.length} accounts, ${transactions.length} transactions, ${upis.length} UPI entities, ${beneficiaries.length} beneficiaries.`);
        const graph = new TransactionGraph_1.TransactionGraph(accounts, transactions, upis, beneficiaries, incidents);
        const traceEngine = new TraceEngine_1.TraceEngine(graph, adapter);
        const simulationService = new SimulationService_1.SimulationService(adapter, graph, traceEngine);
        // Mount API Routes
        const apiRouter = (0, api_1.createApiRouter)(adapter, graph, traceEngine, simulationService);
        app.use('/api', apiRouter);
        // Serve Frontend Client Static Assets
        const clientDistPath = path_1.default.resolve(__dirname, '../../client/dist');
        app.use(express_1.default.static(clientDistPath));
        // Handle /money-flow, /money-flow/:transactionId and root fallback
        app.get(['/', '/money-flow', '/money-flow/*'], (req, res) => {
            const indexPath = path_1.default.join(clientDistPath, 'index.html');
            if (fs_1.default.existsSync(indexPath)) {
                res.sendFile(indexPath);
            }
            else {
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
    }
    catch (err) {
        console.error('[FraudNexus Server] Bootstrap Failed:', err);
        process.exit(1);
    }
}
bootstrap();
