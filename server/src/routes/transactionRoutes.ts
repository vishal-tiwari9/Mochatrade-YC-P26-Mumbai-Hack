import { Router, Request, Response } from 'express';
import { appContext } from '../services/appContext.js';
import { z } from 'zod';

export const transactionRouter = Router();

// Validation schema for incoming transaction
const IngestTxnSchema = z.object({
  transactionId: z.string().optional(),
  timestamp: z.string().optional(),
  senderAccountId: z.string().min(1, 'senderAccountId is required'),
  receiverAccountId: z.string().min(1, 'receiverAccountId is required'),
  senderUpiId: z.string().optional(),
  receiverUpiId: z.string().optional(),
  deviceId: z.string().optional(),
  phoneHash: z.string().optional(),
  amount: z.number().positive('amount must be positive'),
  currency: z.string().default('INR'),
  merchantId: z.string().optional(),
  beneficiaryId: z.string().optional(),
  channel: z.enum(['UPI', 'IMPS', 'NEFT', 'RTGS', 'CARD']).default('UPI'),
  status: z.enum(['SUCCESS', 'FAILED', 'FLAGGED']).default('SUCCESS'),
  location: z.object({
    city: z.string().default('Mumbai'),
    state: z.string().default('Maharashtra'),
    ipHash: z.string().optional()
  }).optional()
});

/**
 * POST /api/transactions/ingest
 * Ingests a new transaction, triggers normalization, entity resolution, graph update, and cluster analysis
 */
transactionRouter.post('/ingest', async (req: Request, res: Response) => {
  try {
    const parseResult = IngestTxnSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format()
      });
    }

    const output = await appContext.ingestPipeline.processIncomingTransaction(parseResult.data as any);

    res.json({
      success: true,
      data: output
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/data/reload
 * Resets or reloads dataset
 */
transactionRouter.post('/reload', async (_req: Request, res: Response) => {
  try {
    await appContext.reload();
    res.json({
      success: true,
      message: 'Dataset reloaded and clusters recalculated successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
