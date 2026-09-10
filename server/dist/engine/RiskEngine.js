"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskEngine = void 0;
class RiskEngine {
    static calculatePathRisk(params) {
        const breakdown = [];
        let score = 10; // Baseline network interaction score
        // 1. Known Fraud Incident Association (+25)
        if (params.hasFraudIncident) {
            score += 25;
            breakdown.push({
                factor: 'Known Fraud Incident Association',
                points: 25,
                rationale: 'Direct link discovered to an active or reported Fraud Incident in FraudNexus database.'
            });
        }
        // 2. Rapid Fund Movement / High Velocity (+20)
        const quickHops = params.edges.filter(e => e.timeDiffMinutes <= 5).length;
        if (quickHops >= 2 || (params.edges.length > 0 && params.totalPropagationMinutes <= 20)) {
            const pts = quickHops >= 2 ? 20 : 12;
            score += pts;
            breakdown.push({
                factor: 'Rapid Fund Movement (High Velocity)',
                points: pts,
                rationale: `Funds traversed ${params.edges.length} hops within ${params.totalPropagationMinutes} minutes, indicating automated or coordinated mule pass-through.`
            });
        }
        // 3. Multi-Hop Intermediary Layering (+15)
        if (params.nodes.length >= 4) {
            const pts = Math.min(18, params.nodes.length * 4);
            score += pts;
            breakdown.push({
                factor: 'Multi-Tier Intermediary Layering',
                points: pts,
                rationale: `Path traverses ${params.nodes.length - 2} intermediary accounts, typical of obfuscation layering chains.`
            });
        }
        // 4. High-Risk Intermediaries / Potential Mules (+18)
        const highRiskNodes = params.nodes.filter(n => n.riskScore >= 80);
        if (highRiskNodes.length > 0) {
            const pts = Math.min(22, highRiskNodes.length * 9);
            score += pts;
            breakdown.push({
                factor: 'High-Risk Intermediary Presence',
                points: pts,
                rationale: `${highRiskNodes.length} entity in this pathway exhibits individual risk telemetry exceeding 80/100.`
            });
        }
        // 5. Fan-Out / Dispersal Topologies (+12)
        if (params.fanOutCount > 0) {
            score += 12;
            breakdown.push({
                factor: 'Fan-Out Dispersal Pattern',
                points: 12,
                rationale: 'Source or intermediary disperses incoming funds rapidly into multiple downstream accounts.'
            });
        }
        // 6. Fan-In / Fund Consolidation Topologies (+12)
        if (params.fanInCount > 0) {
            score += 12;
            breakdown.push({
                factor: 'Fund Consolidation Pattern',
                points: 12,
                rationale: 'Consolidation entity funnels transfers from multiple distinct sources into a single accumulator.'
            });
        }
        // 7. Circular Flow Cycle Detected (+15)
        if (params.hasCircularFlow) {
            score += 15;
            breakdown.push({
                factor: 'Circular Flow Cycle Detected',
                points: 15,
                rationale: 'Closed loop cycle identified where money round-trips back to an originating or intermediary entity.'
            });
        }
        // 8. High Value Concentration
        const maxAmount = Math.max(...params.transactions.map(t => t.amount), 0);
        if (maxAmount >= 200000) {
            score += 8;
            breakdown.push({
                factor: 'High Value Exposure Concentration',
                points: 8,
                rationale: `High exposure transaction of ₹${maxAmount.toLocaleString('en-IN')} exceeds standard retail alert threshold.`
            });
        }
        // Normalize final score to 0-100
        const finalScore = Math.min(99, Math.max(10, score));
        let level = 'LOW';
        if (finalScore >= 85) {
            level = 'CRITICAL';
        }
        else if (finalScore >= 60) {
            level = 'HIGH';
        }
        else if (finalScore >= 35) {
            level = 'MEDIUM';
        }
        return {
            score: finalScore,
            level,
            breakdown
        };
    }
}
exports.RiskEngine = RiskEngine;
