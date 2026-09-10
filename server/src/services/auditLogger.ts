import { AuditLogEntry } from '../models/types.js';

class AuditLogService {
  private logs: AuditLogEntry[] = [];

  constructor() {
    this.logAction('SYSTEM_INITIALIZED', 'SYSTEM', undefined, { note: 'FraudNexus Feature 4 Engine started' });
  }

  logAction(action: string, actor: string = 'INVESTIGATOR', clusterId?: string, details: Record<string, any> = {}): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      clusterId,
      details
    };
    this.logs.unshift(entry);
    // Keep max 200 logs
    if (this.logs.length > 200) {
      this.logs.pop();
    }
    return entry;
  }

  getRecentLogs(limit: number = 50): AuditLogEntry[] {
    return this.logs.slice(0, limit);
  }
}

export const auditLogger = new AuditLogService();
