# INSTRUCCIONES DEL PROYECTO CRM-SHOPIFY

## CONTEXTO
Estás trabajando en un CRM integrado con Shopify y Stripe. Es un backend NestJS desplegado en Vercel con PostgreSQL en EasyPanel.

## INICIO DE SESIÓN - EJECUTA SIEMPRE ESTO PRIMERO:

1. **LEE PRIMERO**: El documento `INICIO_RAPIDO.md` para entender el proyecto en 2 minutos.

2. **VERIFICA EL ESTADO** ejecutando este código:
```javascript
// Verificar Backend
const health = await api_manager.test_api({
  api_name: "crm-backend-shopify",
  endpoint: "/health",
  method: "GET"
});
console.log("Backend:", health.status === 200 ? "✅ OK" : "❌ ERROR");

// Conectar DB
await postgres_db_sleep.connect_db({
  host: "168.231.92.67",
  port: 5437,
  database: "db-shopify",
  user: "postgres",
  password: "Atec2019chino"
});
console.log("DB: ✅ Conectada");
```

## DOCUMENTACIÓN DISPONIBLE:
- `INICIO_RAPIDO.md` - Resumen ejecutivo (LEER PRIMERO)
- `PROYECTO_CONTEXTO_COMPLETO.md` - Documentación detallada
- `MCP_GUIA_PRACTICA.md` - Ejemplos de código para MCPs
- `CLAUDE_VERIFICACION.md` - Códigos de verificación listos para usar

## HERRAMIENTAS MCP QUE DEBES USAR:

1. **api-manager** - Para probar APIs
   - Backend producción: "crm-backend-shopify"
   - Vercel API: "vercel"
   
2. **postgres-db-sleep** - Para base de datos
   - Host: 168.231.92.67, Port: 5437
   - Database: db-shopify, User: postgres
   
3. **desktop-commander** - Para comandos locales
   - Carpeta proyecto: C:\Users\Andybeats\Desktop\nestjs-easypanel
   
4. **filesystem** - Para archivos del proyecto

## FLUJO DE TRABAJO:

### Para DESARROLLO:
1. Hacer cambios en archivos locales
2. Probar con: `npm run start:dev` (puerto 3000)
3. Verificar con api-manager en localhost
4. Si OK, hacer commit y push

### Para DEPLOY:
```bash
# Opción 1: Vercel CLI
cd C:\Users\Andybeats\Desktop\nestjs-easypanel && vercel --prod

# Opción 2: Git (deploy automático)
git add . && git commit -m "mensaje" && git push origin master
```

### Para CONSULTAS DB:
```javascript
// Siempre conectar primero
await postgres_db_sleep.connect_db({...});

// Luego consultar
await postgres_db_sleep.query({ sql: "SELECT * FROM products" });
```

## INFORMACIÓN CLAVE:
- **Backend URL**: https://crm-backend-shopify.vercel.app/api
- **GitHub**: https://github.com/luiso2/crm-shopify
- **Carpeta Local**: C:\Users\Andybeats\Desktop\nestjs-easypanel
- **CORS**: Completamente abierto (acepta cualquier origen)
- **API Prefix**: Todos los endpoints llevan /api
- **21 tablas** en PostgreSQL (users, shopify_orders, stripe_payments, etc.)

## REGLAS IMPORTANTES:
1. SIEMPRE verificar el estado del proyecto al inicio
2. PROBAR localmente antes de hacer deploy
3. USAR api-manager para verificar endpoints
4. CONSULTAR MCP_GUIA_PRACTICA.md para ejemplos
5. NO hacer cambios directos en producción sin probar

## SI HAY PROBLEMAS:
1. Revisar logs con: `vercel logs crm-backend-shopify`
2. Verificar conexión DB con query simple: `SELECT 1`
3. Consultar PROYECTO_CONTEXTO_COMPLETO.md para detalles
4. Verificar que EasyPanel esté funcionando

## ENDPOINTS DISPONIBLES:
- GET /api - Health check
- GET /api/health - Estado detallado
- GET /api/products - Listar productos
- POST /api/products - Crear producto
- GET /api/products/:id - Ver producto
- PUT /api/products/:id - Actualizar
- DELETE /api/products/:id - Eliminar
