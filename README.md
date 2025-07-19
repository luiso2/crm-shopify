# 🚀 CRM-SHOPIFY BACKEND

Backend NestJS para CRM integrado con Shopify y Stripe, desplegado en Vercel con base de datos PostgreSQL en EasyPanel.

## 📚 DOCUMENTACIÓN PARA CLAUDE/DESARROLLADORES

### 🔥 INICIO RÁPIDO
Lee **`INICIO_RAPIDO.md`** para entender el proyecto en 2 minutos.

### 📋 DOCUMENTACIÓN COMPLETA
1. **`INICIO_RAPIDO.md`** - Resumen ejecutivo del proyecto (LEER PRIMERO)
2. **`PROYECTO_CONTEXTO_COMPLETO.md`** - Documentación detallada de todo el proyecto
3. **`MCP_GUIA_PRACTICA.md`** - Ejemplos de uso de herramientas MCP
4. **`verificar-proyecto.js`** - Script para verificar que todo funciona

### 📁 ESTRUCTURA
```
├── src/
│   ├── main.ts              # Entrada principal (CORS configurado)
│   ├── app.module.ts        # Módulo principal
│   └── product/             # Módulo de ejemplo
├── api/                     # Configuración Vercel
├── vercel.json             # Config de deployment
└── Documentación/
    ├── INICIO_RAPIDO.md
    ├── PROYECTO_CONTEXTO_COMPLETO.md
    └── MCP_GUIA_PRACTICA.md
```

## 🚀 DESARROLLO

### Instalación
```bash
npm install
```

### Desarrollo local
```bash
npm run start:dev
# API disponible en http://localhost:3000
```

### Deploy a producción
```bash
# Opción 1: Vercel CLI
vercel --prod

# Opción 2: Git (deploy automático)
git push origin master
```

## 🌐 URLS

- **API Producción**: https://crm-backend-shopify.vercel.app/api
- **GitHub**: https://github.com/luiso2/crm-shopify
- **Vercel Dashboard**: https://vercel.com/mercatops-projects/crm-backend-shopify

## 🔑 VARIABLES DE ENTORNO

```env
DB_HOST=168.231.92.67    # Para producción
DB_PORT=5437             # Puerto externo
DB_USERNAME=postgres
DB_PASSWORD=Atec2019chino
DB_NAME=db-shopify
PORT=3000
```

## 📡 ENDPOINTS DISPONIBLES

```
GET    /api                  # Health check
GET    /api/health          # Estado detallado
GET    /api/products        # Listar productos
POST   /api/products        # Crear producto
GET    /api/products/:id    # Obtener producto
PUT    /api/products/:id    # Actualizar producto
DELETE /api/products/:id    # Eliminar producto
```

## 🛠️ HERRAMIENTAS MCP PARA CLAUDE

1. **api-manager** - Gestión y prueba de APIs
2. **postgres-db-sleep** - Acceso directo a PostgreSQL
3. **desktop-commander** - Ejecución de comandos locales
4. **filesystem** - Gestión de archivos
5. **easypanel** - Control del servidor

## ⚡ VERIFICAR ESTADO

Ejecuta este comando para verificar que todo funciona:
```javascript
// En Claude, ejecuta:
await desktop_commander.start_process({
  command: "node C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel\\verificar-proyecto.js",
  timeout_ms: 30000
});
```

## 📊 BASE DE DATOS

21 tablas incluyendo:
- Sistema de usuarios (`users`, `agents`)
- Integración Shopify (`shopify_orders`, `shopify_products`, etc.)
- Integración Stripe (`stripe_payments`, `stripe_subscriptions`)
- Comunicación (`conversations`, `messages`, `support_tickets`)

## 🔄 FLUJO DE TRABAJO

1. **Desarrollar** localmente
2. **Probar** con `npm run start:dev`
3. **Verificar** con herramientas MCP
4. **Deploy** con Vercel CLI o Git
5. **Confirmar** en producción

## ⚠️ NOTAS IMPORTANTES

- **CORS**: Completamente abierto (acepta cualquier origen)
- **Base de datos**: Puerto 5437 desde internet, 5432 interno
- **TypeORM**: `synchronize: true` solo en desarrollo
- **Deploy**: Automático al hacer push a master

---

**Para Claude**: Empieza leyendo `INICIO_RAPIDO.md` y ejecuta `verificar-proyecto.js` para entender el estado actual del proyecto.
