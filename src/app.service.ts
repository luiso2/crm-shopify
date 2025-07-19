import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'API CRM Shopify - NestJS funcionando correctamente!';
  }
}
