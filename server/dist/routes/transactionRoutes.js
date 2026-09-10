"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRouter = void 0;
const express_1 = require("express");
const appContext_js_1 = require("../services/appContext.js");
const zod_1 = require("zod");
exports.transactionRouter = (0, express_1.Router)();
// Validation schema for incoming transaction
const IngestTxnSchema = zod_1.z.object({
    transactionId: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().optional(),
    senderAccountId: zod_1.z.string().min(1, 'senderAccountId is required'),
    receiverAccountId: zod_1.z.string().min(1, 'receiverAccountId is required'),
    senderUpiId: zod_1.z.string().optional(),
    receiverUpiId: zod_1.z.string().optional(),
    deviceId: zod_1.z.string().optional(),
    phoneHash: zod_1.z.string().optional(),
    amount: zod_1.z.number().positive('amount must be positive'),
    currency: zod_1.z.string().default('INR'),
    merchantId: zod_1.z.string().optional(),
    beneficiaryId: zod_1.z.string().optional(),
    channel: zod_1.z.enum(['UPI', 'IMPS', 'NEFT', 'RTGS', 'CARD']).default('UPI'),
    status: zod_1.z.enum(['SUCCESS', 'FAILED', 'FLAGGED']).default('SUCCESS'),
    location: zod_1.z.object({
        city: zod_1.z.string().default('Mumbai'),
        state: zod_1.z.string().default('Maharashtra'),
        ipHash: zod_1.z.string().optional()
    }).optional()
});
/**
 * POST /api/transactions/ingest
 * Ingests a new transaction, triggers normalization, entity resolution, graph update, and cluster analysis
 */
exports.transactionRouter.post('/ingest', async (req, res) => {
    try {
        const parseResult = IngestTxnSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: parseResult.error.format()
            });
        }
        const output = await appContext_js_1.appContext.ingestPipeline.processIncomingTransaction(parseResult.data);
        res.json({
            success: true,
            data: output
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/data/reload
 * Resets or reloads dataset
 */
exports.transactionRouter.post('/reload', async (_req, res) => {
    try {
        await appContext_js_1.appContext.reload();
        res.json({
            success: true,
            message: 'Dataset reloaded and clusters recalculated successfully.'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
