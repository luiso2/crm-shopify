# 🚀 CONTEXTO DEL PROYECTO CRM-SHOPIFY

## 📋 RESUMEN EJECUTIVO

Este es un **CRM integrado con Shopify y Stripe** que gestiona clientes, órdenes, productos y comunicaciones. El proyecto consta de:
- **Backend NestJS** desplegado en Vercel
- **Base de datos PostgreSQL** alojada en EasyPanel
- **Integración con Shopify** para e-commerce
- **Integración con Stripe** para pagos
- **Sistema de chat y soporte** integrado

## 🔧 STACK TECNOLÓGICO

- **Backend**: NestJS + TypeScript
- **Base de datos**: PostgreSQL (con Prisma y TypeORM)
- **Hosting Backend**: Vercel (Serverless Functions)
- **Hosting DB**: EasyPanel (VPS 168.231.92.67)
- **Integraciones**: Shopify API, Stripe API
- **Autenticación**: JWT
- **ORM**: TypeORM (para nuevas entidades) + Prisma (sistema legacy)

## 📁 ESTRUCTURA DEL PROYECTO

```
C:\Users\Andybeats\Desktop\nestjs-easypanel\
├── src/
│   ├── main.ts              # Punto de entrada con CORS abierto
│   ├── app.module.ts        # Módulo principal con conexión DB
│   ├── product/             # Módulo de productos (ejemplo)
│   │   ├── product.entity.ts
│   │   ├── product.service.ts
│   │   ├── product.controller.ts
│   │   └── product.module.ts
├── api/                     # Configuración para Vercel
│   └── index.js
├── vercel.json             # Configuración de Vercel
├── package.json
├── Dockerfile              # Para despliegue en EasyPanel
└── .env.example           # Variables de entorno de referencia
```

## 🌐 URLS Y ENDPOINTS

### Backend en Producción (Vercel)
- **URL Base**: https://crm-backend-shopify.vercel.app
- **API Base**: https://crm-backend-shopify.vercel.app/api

### Endpoints Disponibles
```
GET    /api                  # Health check principal
GET    /api/health          # Estado detallado
GET    /api/products        # Listar productos
POST   /api/products        # Crear producto
GET    /api/products/:id    # Obtener producto
PUT    /api/products/:id    # Actualizar producto
DELETE /api/products/:id    # Eliminar producto
```

### Repositorio GitHub
- **URL**: https://github.com/luiso2/crm-shopify
- **Branch**: master

## 🗄️ BASE DE DATOS

### Conexión PostgreSQL
```javascript
// Conexión desde Internet (producción)
{
  host: '168.231.92.67',
  port: 5437,              // Puerto externo
  database: 'db-shopify',
  username: 'postgres',
  password: 'Atec2019chino'
}

// Conexión desde EasyPanel (interna)
{
  host: 'db-shopify',
  port: 5432,              // Puerto interno
  database: 'db-shopify',
  username: 'postgres',
  password: 'Atec2019chino'
}
```

### Tablas Principales (21 en total)

#### Sistema de Usuarios
- `users` - Usuarios del sistema (id, email, password, role)
- `user_profiles` - Perfiles extendidos
- `sessions` - Sesiones activas
- `agents` - Agentes del CRM

#### Integración Shopify
- `shopify_orders` - Órdenes (id, totalPrice, items JSONB)
- `shopify_customers` - Clientes de Shopify
- `shopify_products` - Catálogo de productos
- `shopify_coupons` - Cupones disponibles
- `coupon_usage` - Registro de uso de cupones

#### Integración Stripe
- `stripe_customers` - Clientes en Stripe
- `stripe_payments` - Historial de pagos
- `stripe_subscriptions` - Suscripciones activas

#### Comunicación
- `conversations` - Conversaciones del CRM
- `messages` - Mensajes individuales
- `widget_sessions` - Sesiones del widget de chat
- `support_tickets` - Tickets de soporte

#### Gestión
- `leads` - Prospectos/leads
- `reports` - Reportes generados
- `files` - Archivos almacenados
- `products` - Productos (creada por NestJS/TypeORM)

## 🛠️ HERRAMIENTAS MCP DISPONIBLES

### 1. API Manager (`api-manager`)
Gestiona las conexiones a APIs. APIs configuradas:
- `vercel` - Para deployments
- `crm-backend-shopify` - El backend desplegado
- `shopify` - API de Shopify
- `easypanel` - Panel de control del servidor

### 2. PostgreSQL (`postgres-db-sleep`)
Conexión directa a la base de datos para consultas SQL.

### 3. EasyPanel (`easypanel`)
Gestión del servidor y servicios en EasyPanel.

### 4. Desktop Commander (`desktop-commander`)
Ejecuta comandos locales, gestión de archivos.

### 5. Filesystem (`filesystem`)
Lectura y escritura de archivos del proyecto.

## 📋 FLUJO DE TRABAJO DE DESARROLLO

### 1. Desarrollo Local
```bash
# Clonar repositorio
git clone https://github.com/luiso2/crm-shopify.git
cd crm-shopify

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run start:dev

# La API estará en http://localhost:3000
```

### 2. Probar Backend Local
```javascript
// Usar API Manager para probar localmente
await api_manager.test_api({
  api_name: "local-backend",
  endpoint: "/api/products",
  method: "GET"
});
```

### 3. Verificar Base de Datos
```javascript
// Conectar con PostgreSQL MCP
await postgres_db_sleep.connect_db({
  host: "168.231.92.67",
  port: 5437,
  database: "db-shopify",
  user: "postgres",
  password: "Atec2019chino"
});

// Consultar datos
await postgres_db_sleep.query({
  sql: "SELECT * FROM products LIMIT 10"
});
```

### 4. Deploy a Vercel
```bash
# Usando Vercel CLI (ya instalado)
cd C:\Users\Andybeats\Desktop\nestjs-easypanel
vercel --prod

# O mediante Git push
git add .
git commit -m "Update: descripción del cambio"
git push origin master
```

### 5. Verificar Deploy
```javascript
// Probar API en producción
await api_manager.test_api({
  api_name: "crm-backend-shopify",
  endpoint: "/products",
  method: "GET"
});
```

## 🔑 CREDENCIALES Y ACCESOS

### Vercel
- **Dashboard**: https://vercel.com/mercatops-projects/crm-backend-shopify
- **API Token**: Configurado en `api-manager` como "vercel"

### EasyPanel
- **URL**: http://168.231.92.67:3000
- **Proyecto**: crm-shopify
- **Servicios**: db-shopify (PostgreSQL), db-redis-shopify (Redis)

### GitHub
- **Repositorio**: https://github.com/luiso2/crm-shopify
- **Branch principal**: master

## 🚀 COMANDOS ÚTILES

### Git
```bash
git status
git add .
git commit -m "mensaje"
git push origin master
```

### NPM
```bash
npm install              # Instalar dependencias
npm run start:dev       # Desarrollo local
npm run build          # Construir para producción
npm run start:prod     # Ejecutar build de producción
```

### Vercel CLI
```bash
vercel                  # Deploy preview
vercel --prod          # Deploy producción
vercel logs --follow   # Ver logs en tiempo real
vercel env ls          # Listar variables de entorno
```

### PostgreSQL (usando MCP)
```javascript
// Listar tablas
await postgres_db_sleep.list_tables();

// Describir tabla
await postgres_db_sleep.describe_table({ table: "nombre_tabla" });

// Consulta personalizada
await postgres_db_sleep.query({ 
  sql: "SELECT COUNT(*) FROM products" 
});
```

## 📝 NOTAS IMPORTANTES

1. **CORS**: Está completamente abierto para aceptar solicitudes desde cualquier origen
2. **Base de datos**: Usa el puerto 5437 desde internet, 5432 internamente en EasyPanel
3. **TypeORM**: Configurado con `synchronize: true` (solo para desarrollo)
4. **Vercel**: Los deploys son automáticos al hacer push a GitHub
5. **API Prefix**: Todos los endpoints tienen el prefijo `/api`

## 🔄 PROCESO DE ACTUALIZACIÓN

1. **Hacer cambios** en el código local
2. **Probar localmente** con `npm run start:dev`
3. **Verificar** con API Manager que todo funciona
4. **Commit y push** a GitHub
5. **Vercel despliega automáticamente** (o usar `vercel --prod`)
6. **Verificar en producción** con API Manager

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

### Error de conexión a DB
- Verificar que estés usando el puerto correcto (5437 desde internet)
- Verificar que EasyPanel esté funcionando
- Comprobar credenciales

### Error en Vercel
- Revisar logs: `vercel logs`
- Verificar variables de entorno en Vercel dashboard
- Asegurarse de que el build se complete sin errores

### CORS no funciona
- Verificar que `app.enableCors({ origin: true })` esté en main.ts
- Limpiar caché del navegador
- Verificar headers en la respuesta

## 📚 RECURSOS ADICIONALES

- **NestJS Docs**: https://docs.nestjs.com
- **TypeORM Docs**: https://typeorm.io
- **Vercel Docs**: https://vercel.com/docs
- **EasyPanel**: https://easypanel.io/docs

---

**ÚLTIMA ACTUALIZACIÓN**: 19 de Julio 2025
**PROYECTO ACTIVO**: ✅ Funcionando en producción
**PRÓXIMOS PASOS**: Agregar más módulos (usuarios, órdenes, clientes)
