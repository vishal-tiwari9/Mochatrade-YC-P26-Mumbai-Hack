import { IDataAdapter } from './IDataAdapter.js';
import { DemoDataAdapter } from './DemoDataAdapter.js';
import { BankDataAdapter } from './BankDataAdapter.js';
import { PaymentDataAdapter } from './PaymentDataAdapter.js';
import { CSVDataAdapter } from './CSVDataAdapter.js';
import { WebhookDataAdapter } from './WebhookDataAdapter.js';

export function getSelectedDataAdapter(): IDataAdapter {
  const source = (process.env.DATA_SOURCE || 'demo').toLowerCase().trim();

  switch (source) {
    case 'bank':
      return new BankDataAdapter();
    case 'payment':
    case 'switch':
      return new PaymentDataAdapter();
    case 'csv':
      return new CSVDataAdapter();
    case 'webhook':
      return new WebhookDataAdapter();
    case 'demo':
    default:
      return new DemoDataAdapter();
  }
}

export function getAvailableAdaptersStatus() {
  const current = (process.env.DATA_SOURCE || 'demo').toLowerCase().trim();
  return [
    {
      id: 'demo',
      name: 'Local Synthetic Dataset Adapter',
      type: 'SYNTHETIC_OFFLINE',
      active: current === 'demo',
      ready: true,
      description: 'Zero-setup realistic fraud dataset with 55+ accounts, 230+ txns, and target cluster FNX-CL-2841.'
    },
    {
      id: 'bank',
      name: 'Core Banking (ISO 20022 / CBS) Adapter',
      type: 'ENTERPRISE_API',
      active: current === 'bank',
      ready: Boolean(process.env.BANK_API_ENDPOINT),
      description: 'Direct ledger feed for Finacle/BaNCS pacs.008 & camt.053 message settlement.'
    },
    {
      id: 'payment',
      name: 'NPCI UPI Switch / Gateway Adapter',
      type: 'SWITCH_STREAM',
      active: current === 'payment',
      ready: Boolean(process.env.PAYMENT_GATEWAY_URL),
      description: 'Low-latency streaming adapter for real-time UPI switch routing logs.'
    },
    {
      id: 'csv',
      name: 'Forensic Batch CSV Adapter',
      type: 'BATCH_FILE',
      active: current === 'csv',
      ready: Boolean(process.env.CSV_DATA_PATH),
      description: 'Ingest historical law enforcement or compliance audit dumps.'
    },
    {
      id: 'webhook',
      name: 'Signed Transaction Webhook Adapter',
      type: 'REALTIME_WEBHOOK',
      active: current === 'webhook',
      ready: Boolean(process.env.WEBHOOK_SECRET),
      description: 'HMAC-SHA256 authenticated event receiver for external core systems.'
    }
  ];
}
