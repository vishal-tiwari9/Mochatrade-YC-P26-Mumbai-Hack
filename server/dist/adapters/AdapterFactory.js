"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterFactory = void 0;
const DemoDataAdapter_1 = require("./DemoDataAdapter");
const Placeholders_1 = require("./Placeholders");
class AdapterFactory {
    static instance = null;
    static currentSource = process.env.DATA_SOURCE || 'demo';
    static async getAdapter() {
        if (!this.instance) {
            this.instance = this.createAdapter(this.currentSource);
            await this.instance.initialize();
        }
        return this.instance;
    }
    static async switchAdapter(source) {
        this.currentSource = source;
        this.instance = this.createAdapter(source);
        await this.instance.initialize();
        return this.instance;
    }
    static getCurrentSource() {
        return this.currentSource;
    }
    static createAdapter(source) {
        switch (source.toLowerCase()) {
            case 'bank':
                return new Placeholders_1.BankDataAdapter();
            case 'payment':
                return new Placeholders_1.PaymentDataAdapter();
            case 'csv':
                return new Placeholders_1.CSVDataAdapter();
            case 'webhook':
                return new Placeholders_1.WebhookDataAdapter();
            case 'demo':
            default:
                return new DemoDataAdapter_1.DemoDataAdapter();
        }
    }
}
exports.AdapterFactory = AdapterFactory;
