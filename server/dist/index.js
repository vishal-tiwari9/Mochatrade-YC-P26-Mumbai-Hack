"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const appContext_js_1 = require("./services/appContext.js");
const clusterRoutes_js_1 = require("./routes/clusterRoutes.js");
const transactionRoutes_js_1 = require("./routes/transactionRoutes.js");
const systemRoutes_js_1 = require("./routes/systemRoutes.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
// Basic Rate Limiter for API security (300 requests per 15 minutes per IP)
const limiter = (0, express_rate_limit_1.default)({
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
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '5mb' }));
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
app.use('/api/fraud-clusters', clusterRoutes_js_1.clusterRouter);
app.use('/api/transactions', transactionRoutes_js_1.transactionRouter);
app.use('/api/data', transactionRoutes_js_1.transactionRouter);
app.use('/api/data-source', systemRoutes_js_1.systemRouter);
app.use('/api/system', systemRoutes_js_1.systemRouter);
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('[Server Error]', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});
async function startServer() {
    try {
        console.log('[Server] Initializing FraudNexus Detection Engine...');
        await appContext_js_1.appContext.init();
        app.listen(PORT, () => {
            console.log(`=======================================================`);
            console.log(`🚀 FraudNexus Feature 4 Engine running on port ${PORT}`);
            console.log(`📊 Mode: DATA_SOURCE=${process.env.DATA_SOURCE || 'demo'}`);
            console.log(`🔗 API Base: http://localhost:${PORT}/api/fraud-clusters`);
            console.log(`=======================================================`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
