"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
class AuditLogService {
    logs = [];
    constructor() {
        this.logAction('SYSTEM_INITIALIZED', 'SYSTEM', undefined, { note: 'FraudNexus Feature 4 Engine started' });
    }
    logAction(action, actor = 'INVESTIGATOR', clusterId, details = {}) {
        const entry = {
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
    getRecentLogs(limit = 50) {
        return this.logs.slice(0, limit);
    }
}
exports.auditLogger = new AuditLogService();
