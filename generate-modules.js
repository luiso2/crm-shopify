// Este archivo genera automáticamente los módulos CRUD para todas las tablas de la base de datos
import * as fs from 'fs';
import * as path from 'path';

interface TableColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary_key: boolean;
  character_maximum_length: number | null;
}

interface TableModule {
  tableName: string;
  moduleName: string;
  entityName: string;
  columns: TableColumn[];
}

// Configuración de tablas y sus estructuras
const tablesConfig: { [key: string]: any } = {
  'agents': {
    columns: [
      { name: 'id', type: 'string', primary: true },
      { name: 'userId', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string', unique: true },
      { name: 'status', type: 'enum', enum: ['ONLINE', 'OFFLINE', 'BUSY'] },
      { name: 'department', type: 'string', nullable: true },
      { name: 'avatar', type: 'string', nullable: true },
      { name: 'createdAt', type: 'Date', createDate: true },
      { name: 'updatedAt', type: 'Date', updateDate: true }
    ]
  },
  'conversations': {
    columns: [
      { name: 'id', type: 'string', primary: true },
      { name: 'customerId', type: 'string' },
      { name: 'agentId', type: 'string', nullable: true },
      { name: 'status', type: 'enum', enum: ['OPEN', 'CLOSED', 'PENDING'] },
      { name: 'priority', type: 'enum', enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
      { name: 'subject', type: 'string', nullable: true },
      { name: 'lastMessageAt', type: 'Date', nullable: true },
      { name: 'createdAt', type: 'Date', createDate: true },
      { name: 'updatedAt', type: 'Date', updateDate: true }
    ]
  },
  'messages': {
    columns: [
      { name: 'id', type: 'string', primary: true },
      { name: 'conversationId', type: 'string' },
      { name: 'senderId', type: 'string' },
      { name: 'senderType', type: 'enum', enum: ['CUSTOMER', 'AGENT', 'SYSTEM'] },
      { name: 'content', type: 'text' },
      { name: 'attachments', type: 'jsonb', nullable: true },
      { name: 'isRead', type: 'boolean', default: false },
      { name: 'createdAt', type: 'Date', createDate: true },
      { name: 'updatedAt', type: 'Date', updateDate: true }
    ]
  },
  'shopify_customers': {
    columns: [
      { name: 'id', type: 'string', primary: true },
      { name: 'shopifyCustomerId', type: 'string', unique: true },
      { name: 'email', type: 'string' },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'phone', type: 'string', nullable: true },
      { name: 'acceptsMarketing', type: 'boolean', default: false },
      { name: 'totalSpent', type: 'decimal', precision: 10, scale: 2, default: 0 },
      { name: 'ordersCount', type: 'number', default: 0 },
      { name: 'tags', type: 'jsonb', nullable: true },
      { name: 'createdAt', type: 'Date', createDate: true },
      { name: 'updatedAt', type: 'Date', updateDate: true }
    ]
  },
  'shopify_products': {
    columns: [
      { name: 'id', type: 'string', primary: true },
      { name: 'shopifyProductId', type: 'string', unique: true },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'text', nullable: true },
      { name: 'vendor', type: 'string', nullable: true },
      { name: 'productType', type: 'string', nullable: true },
      { name: 'tags', type: 'jsonb', nullable: true },
      { name: 'images', type: 'jsonb', nullable: true },
      { name: 'variants', type: 'jsonb', nullable: true },
      { name: 'status', type: 'string', default: 'active' },
      { name: 'createdAt', type: 'Date', createDate: true },
      { name: 'updatedAt', type: 'Date', updateDate: true }
    ]
  },
  'stripe_customers': {
    columns: [
      { name: 'id', type: 'string', primary: true },
      { name: 'stripeCustomerId', type: 'string', unique: true },
      { name: 'customerId', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'name', type: 'string', nullable: true },
      { name: 'phone', type: 'string', nullable: true },
      { name: 'defaultPaymentMethod', type: 'string', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'createdAt', type: 'Date', createDate: true },
      { name: 'updatedAt', type: 'Date', updateDate: true }
    ]
  },
  'stripe_payments': {
    columns: [
      { name: 'id', type: 'string', primary: true },
      { name: 'stripePaymentIntentId', type: 'string', unique: true },
      { name: 'stripeCustomerId', type: 'string' },
      { name: 'orderId', type: 'string', nullable: true },
      { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
      { name: 'currency', type: 'string', default: 'USD' },
      { name: 'status', type: 'string' },
      { name: 'paymentMethod', type: 'string', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'createdAt', type: 'Date', createDate: true },
      { name: 'updatedAt', type: 'Date', updateDate: true }
    ]
  },
  'support_tickets': {
    columns: [
      { name: 'id', type: 'string', primary: true },
      { name: 'ticketNumber', type: 'string', unique: true },
      { name: 'customerId', type: 'string' },
      { name: 'assignedTo', type: 'string', nullable: true },
      { name: 'subject', type: 'string' },
      { name: 'description', type: 'text' },
      { name: 'status', type: 'enum', enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
      { name: 'priority', type: 'enum', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
      { name: 'category', type: 'string', nullable: true },
      { name: 'tags', type: 'jsonb', nullable: true },
      { name: 'resolvedAt', type: 'Date', nullable: true },
      { name: 'createdAt', type: 'Date', createDate: true },
      { name: 'updatedAt', type: 'Date', updateDate: true }
    ]
  },
  'leads': {
    columns: [
      { name: 'id', type: 'string', primary: true },
      { name: 'email', type: 'string', unique: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'phone', type: 'string', nullable: true },
      { name: 'company', type: 'string', nullable: true },
      { name: 'source', type: 'string', nullable: true },
      { name: 'status', type: 'enum', enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] },
      { name: 'score', type: 'number', default: 0 },
      { name: 'notes', type: 'text', nullable: true },
      { name: 'assignedTo', type: 'string', nullable: true },
      { name: 'convertedAt', type: 'Date', nullable: true },
      { name: 'createdAt', type: 'Date', createDate: true },
      { name: 'updatedAt', type: 'Date', updateDate: true }
    ]
  }
};

// Función para generar nombre de clase desde nombre de tabla
function tableNameToClassName(tableName: string): string {
  return tableName
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// Función para generar nombre de módulo desde nombre de tabla
function tableNameToModuleName(tableName: string): string {
  return tableName.replace(/_/g, '-');
}

console.log('Generador de módulos CRUD para NestJS');
console.log('=====================================\n');

// Generar instrucciones de creación
Object.entries(tablesConfig).forEach(([tableName, config]) => {
  const className = tableNameToClassName(tableName);
  const moduleName = tableNameToModuleName(tableName);
  
  console.log(`\n### Módulo para ${tableName}:`);
  console.log(`Nombre de clase: ${className}`);
  console.log(`Nombre de módulo: ${moduleName}`);
  console.log(`Carpeta: src/${moduleName}`);
  
  console.log('\nArchivos a crear:');
  console.log(`- src/${moduleName}/${moduleName.replace(/-/g, '')}.entity.ts`);
  console.log(`- src/${moduleName}/${moduleName}.service.ts`);
  console.log(`- src/${moduleName}/${moduleName}.controller.ts`);
  console.log(`- src/${moduleName}/${moduleName}.module.ts`);
});

console.log('\n\n### Actualizar app.module.ts:');
console.log('Importar todos los módulos:');
Object.keys(tablesConfig).forEach(tableName => {
  const className = tableNameToClassName(tableName);
  const moduleName = tableNameToModuleName(tableName);
  console.log(`import { ${className}Module } from './${moduleName}/${moduleName}.module';`);
});

console.log('\nAgregar a imports:');
Object.keys(tablesConfig).forEach(tableName => {
  const className = tableNameToClassName(tableName);
  console.log(`    ${className}Module,`);
});

console.log('\n\n¡Listo para generar todos los módulos!');
