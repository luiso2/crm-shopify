# INSTRUCCIONES PARA DESPLEGAR EN EASYPANEL

## Tu repositorio está listo en: https://github.com/luiso2/crm-shopify.git

### Pasos para desplegar manualmente:

1. **Accede a EasyPanel**
   - Ve a tu panel de EasyPanel
   - Entra al proyecto "crm-shopify"

2. **Crear nuevo servicio**
   - Haz clic en "Add Service" o el botón "+"
   - Selecciona "App"

3. **Configurar el servicio**
   
   **Información básica:**
   - Service Name: `api-nestjs`
   
   **Source (Fuente):**
   - Type: Git
   - Repository: `https://github.com/luiso2/crm-shopify.git`
   - Branch: `main`
   - Path: `/` (raíz)
   - Auto Deploy: ✅ (opcional, para despliegue automático)

   **Build:**
   - Type: Dockerfile
   - Dockerfile Path: `Dockerfile`

4. **Variables de entorno**
   
   Añade estas variables en la sección "Environment Variables":
   ```
   DB_HOST=db-shopify
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=Atec2019chino
   DB_NAME=db-shopify
   PORT=3000
   ```

5. **Puertos**
   
   En la sección "Ports":
   - Internal Port: 3000
   - External Port: 3005 (o el que prefieras)

6. **Dominio (opcional)**
   
   En la sección "Domains":
   - Puedes añadir un dominio personalizado o usar el que te proporciona EasyPanel
   - Port: 3000

7. **Deploy**
   
   Haz clic en "Create Service" y luego en "Deploy"

## Verificación

Una vez desplegado (puede tardar 2-5 minutos), podrás acceder a:

- `http://168.231.92.67:3005/` - Mensaje de bienvenida
- `http://168.231.92.67:3005/health` - Estado de la aplicación
- `http://168.231.92.67:3005/products` - Lista de productos

O si configuraste un dominio:
- `https://tu-dominio.easypanel.host/`

## Comandos de prueba

### Crear un producto:
```bash
curl -X POST http://168.231.92.67:3005/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto de prueba",
    "description": "Este es un producto de prueba",
    "price": 99.99,
    "stock": 50
  }'
```

### Listar productos:
```bash
curl http://168.231.92.67:3005/products
```

## Solución de problemas

Si algo no funciona:

1. **Verifica los logs en EasyPanel:**
   - Ve al servicio "api-nestjs"
   - Click en "Logs" para ver los errores

2. **Problemas comunes:**
   - Si ves "Cannot connect to database": Verifica que el servicio db-shopify esté activo
   - Si ves "Port already in use": Cambia el puerto externo a otro (ej: 3006)
   - Si el build falla: Asegúrate de que el repositorio sea público o configura las credenciales de GitHub

3. **Reiniciar el servicio:**
   - En el panel del servicio, click en "Restart"

## Actualizar la aplicación

Cuando hagas cambios en el código:

1. Haz commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Actualización"
   git push
   ```

2. En EasyPanel:
   - Si activaste "Auto Deploy": Se actualizará automáticamente
   - Si no: Click en "Deploy" manualmente

¡Listo! Tu aplicación NestJS debería estar funcionando en EasyPanel.
