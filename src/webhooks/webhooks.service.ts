import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor() {}

  async logWebhook(source: string, event: string, data: any): Promise<void> {
    this.logger.log(`Webhook received from ${source}: ${event}`);
    
    // Aquí podrías guardar logs en base de datos si lo necesitas
    // Por ejemplo, crear una tabla webhook_logs
    
    // Por ahora solo log en consola
    this.logger.debug(`Webhook data: ${JSON.stringify(data)}`);
  }

  async getWebhookStats(): Promise<any> {
    // Retornar estadísticas de webhooks procesados
    return {
      shopify: {
        total: 0,
        today: 0,
        errors: 0,
      },
      stripe: {
        total: 0,
        today: 0,
        errors: 0,
      },
    };
  }
}
