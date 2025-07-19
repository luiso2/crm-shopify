import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { UsersModule } from './users/users.module';
import { ShopifyOrdersModule } from './shopify-orders/shopify-orders.module';
import { ShopifyCustomersModule } from './shopify-customers/shopify-customers.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '168.231.92.67',
      port: parseInt(process.env.DB_PORT) || 5437,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'Atec2019chino',
      database: process.env.DB_NAME || 'db-shopify',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Cambié a false porque las tablas ya existen
      ssl: false,
    }),
    ProductModule,
    UsersModule,
    ShopifyOrdersModule,
    ShopifyCustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
