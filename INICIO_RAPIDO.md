# 🚀 CRM-SHOPIFY: INICIO RÁPIDO

## ¿QUÉ ES ESTE PROYECTO?
**CRM integrado con Shopify + Stripe** para gestionar clientes, órdenes y pagos.

## 🔗 ACCESOS RÁPIDOS
- **Backend API**: https://crm-backend-shopify.vercel.app/api
- **GitHub**: https://github.com/luiso2/crm-shopify
- **Carpeta Local**: `C:\Users\Andybeats\Desktop\nestjs-easypanel`
- **Dashboard Vercel**: https://vercel.com/mercatops-projects/crm-backend-shopify

## 🗄️ BASE DE DATOS POSTGRESQL
```javascript
// Conexión desde Internet
{
  host: '168.231.92.67',
  port: 5437,
  database: 'db-shopify',
  user: 'postgres', 
  password: 'Atec2019chino'
}
```

## 🛠️ HERRAMIENTAS MCP
1. **api-manager** → Probar APIs (backend, vercel, shopify)
2. **postgres-db-sleep** → Consultar/modificar base de datos
3. **desktop-commander** → Ejecutar comandos locales
4. **filesystem** → Leer/escribir archivos del proyecto
5. **easypanel** → Gestionar servidor

## ⚡ COMANDOS ESENCIALES

### Verificar que todo funciona:
```javascript
// 1. Probar API
await api_manager.test_api({
  api_name: "crm-backend-shopify",
  endpoint: "/health",
  method: "GET"
});

// 2. Conectar DB
await postgres_db_sleep.connect_db({
  host: "168.231.92.67",
  port: 5437,
  database: "db-shopify",
  user: "postgres",
  password: "Atec2019chino"
});
```

### Desarrollo local:
```bash
cd C:\Users\Andybeats\Desktop\nestjs-easypanel
npm run start:dev  # Puerto 3000
```

### Deploy a producción:
```bash
# Opción 1: Vercel CLI
vercel --prod

# Opción 2: Git push (deploy automático)
git add . && git commit -m "update" && git push origin master
```

## 📊 TABLAS PRINCIPALES (21 total)
- **users**, **agents** → Sistema de usuarios
- **shopify_orders**, **shopify_customers**, **shopify_products** → E-commerce
- **stripe_payments**, **stripe_subscriptions** → Pagos
- **conversations**, **messages**, **support_tickets** → Comunicación
- **products** → Tabla de ejemplo NestJS

## 🔄 FLUJO DE TRABAJO
1. **Desarrollar** → Cambios en carpeta local
2. **Probar** → `npm run start:dev` + API Manager
3. **Verificar DB** → PostgreSQL MCP
4. **Deploy** → `vercel --prod` o git push
5. **Confirmar** → Probar en producción

## ⚠️ IMPORTANTE
- **CORS**: Completamente abierto (acepta cualquier origen)
- **Puerto DB**: 5437 (externo), 5432 (interno EasyPanel)
- **API Prefix**: Todos los endpoints tienen `/api`
- **TypeORM**: `synchronize: true` (solo desarrollo)

---
**ARCHIVOS DE REFERENCIA COMPLETA**:
- `PROYECTO_CONTEXTO_COMPLETO.md` → Documentación detallada
- `MCP_GUIA_PRACTICA.md` → Ejemplos de uso de MCPs
