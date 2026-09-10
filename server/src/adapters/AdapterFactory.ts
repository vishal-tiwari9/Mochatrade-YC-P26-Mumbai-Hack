import { IDataAdapter } from './IDataAdapter';
import { DemoDataAdapter } from './DemoDataAdapter';
import { BankDataAdapter, PaymentDataAdapter, CSVDataAdapter, WebhookDataAdapter } from './Placeholders';

export class AdapterFactory {
  private static instance: IDataAdapter | null = null;
  private static currentSource: string = process.env.DATA_SOURCE || 'demo';

  public static async getAdapter(): Promise<IDataAdapter> {
    if (!this.instance) {
      this.instance = this.createAdapter(this.currentSource);
      await this.instance.initialize();
    }
    return this.instance;
  }

  public static async switchAdapter(source: string): Promise<IDataAdapter> {
    this.currentSource = source;
    this.instance = this.createAdapter(source);
    await this.instance.initialize();
    return this.instance;
  }

  public static getCurrentSource(): string {
    return this.currentSource;
  }

  private static createAdapter(source: string): IDataAdapter {
    switch (source.toLowerCase()) {
      case 'bank':
        return new BankDataAdapter();
      case 'payment':
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
}
