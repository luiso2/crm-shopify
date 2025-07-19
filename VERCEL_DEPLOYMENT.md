# CRM Backend Shopify - Configuración en Vercel

## ✅ Proyecto creado exitosamente en Vercel

### 📋 Detalles del proyecto:
- **Nombre:** crm-backend-shopify
- **ID del proyecto:** prj_GRCuvqJvKPH2SuYN7OX85ZRVwSC0
- **URL del dashboard:** https://vercel.com/mercatops-projects/crm-backend-shopify

### 🔐 Variables de entorno configuradas:
- `DB_HOST`: 168.231.92.67
- `DB_PORT`: 5437
- `DB_USERNAME`: postgres
- `DB_PASSWORD`: Atec2019chino
- `DB_NAME`: db-shopify
- `PORT`: 3000
- `NODE_ENV`: production

### 🌐 CORS configurado:
- ✅ Acepta solicitudes desde cualquier origen
- ✅ Soporta todos los métodos HTTP
- ✅ Permite credenciales

### 🚀 Próximos pasos:

1. **Conectar el repositorio GitHub:**
   - Ve a: https://vercel.com/mercatops-projects/crm-backend-shopify/settings/git
   - Haz clic en "Connect Git Repository"
   - Selecciona GitHub
   - Autoriza Vercel si es necesario
   - Busca y selecciona: `luiso2/crm-shopify`
   - Branch: `master`

2. **Configurar el Build & Development Settings:**
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `.`
   - Install Command: `npm install`

3. **Deploy:**
   - Una vez conectado el repositorio, Vercel desplegará automáticamente
   - Los futuros pushes a `master` activarán despliegues automáticos

### 📡 URLs de tu aplicación:
Una vez desplegado, tu API estará disponible en:
- **Production:** https://crm-backend-shopify.vercel.app
- **Preview:** https://crm-backend-shopify-git-master-mercatops-projects.vercel.app

### 🧪 Endpoints disponibles:
- `GET https://crm-backend-shopify.vercel.app/api` - Mensaje de bienvenida
- `GET https://crm-backend-shopify.vercel.app/api/health` - Estado de la aplicación
- `GET https://crm-backend-shopify.vercel.app/api/products` - Listar productos
- `POST https://crm-backend-shopify.vercel.app/api/products` - Crear producto
- `GET https://crm-backend-shopify.vercel.app/api/products/:id` - Ver producto
- `PUT https://crm-backend-shopify.vercel.app/api/products/:id` - Actualizar producto
- `DELETE https://crm-backend-shopify.vercel.app/api/products/:id` - Eliminar producto

### 🔧 Comandos útiles:

**Verificar el estado del despliegue:**
```bash
curl https://crm-backend-shopify.vercel.app/api/health
```

**Crear un producto de prueba:**
```bash
curl -X POST https://crm-backend-shopify.vercel.app/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto Test Vercel",
    "description": "Producto creado desde Vercel",
    "price": 149.99,
    "stock": 25
  }'
```

### 📝 Notas importantes:
- La base de datos PostgreSQL está en tu servidor EasyPanel (IP: 168.231.92.67)
- El puerto externo 5437 se usa correctamente desde Vercel
- CORS está completamente abierto como solicitaste
- La API tiene el prefijo `/api` para todas las rutas

### 🔍 Monitoreo:
- Logs: https://vercel.com/mercatops-projects/crm-backend-shopify/logs
- Analytics: https://vercel.com/mercatops-projects/crm-backend-shopify/analytics
- Functions: https://vercel.com/mercatops-projects/crm-backend-shopify/functions

¡Tu backend está listo para usar!
