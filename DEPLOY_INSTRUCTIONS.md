# INSTRUCCIONES DE DESPLIEGUE EN EASYPANEL

## Pasos para desplegar en EasyPanel

### 1. Preparar el código

Primero, necesitas subir este código a un repositorio GitHub:

1. Crea un nuevo repositorio en GitHub
2. Inicializa git en la carpeta del proyecto:
   ```bash
   cd C:\Users\Andybeats\Desktop\nestjs-easypanel
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/nestjs-crm-shopify.git
   git push -u origin main
   ```

### 2. Crear la aplicación en EasyPanel

1. Ve a tu panel de EasyPanel
2. Entra al proyecto "crm-shopify"
3. Haz clic en "Create Service" o "Add Service"
4. Selecciona "App"
5. Configura:
   - Service Name: `api-nestjs`
   - Source: GitHub
   - Repository: La URL de tu repositorio
   - Branch: main

### 3. Configurar las variables de entorno

En la sección de Environment Variables, añade:

```
DB_HOST=db-shopify
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Atec2019chino
DB_NAME=db-shopify
PORT=3000
```

### 4. Configurar el dominio (opcional)

En la sección Domains, puedes añadir:
- Host: `api-crm-shopify.tudominio.com` (o usa el dominio por defecto de EasyPanel)
- Port: 3000

### 5. Deploy

Haz clic en "Deploy" y espera a que se complete.

## Alternativa: Despliegue manual con Docker

Si prefieres construir la imagen localmente:

1. Construye la imagen:
   ```bash
   docker build -t tu-dockerhub-usuario/nestjs-crm-shopify .
   ```

2. Súbela a Docker Hub:
   ```bash
   docker login
   docker push tu-dockerhub-usuario/nestjs-crm-shopify
   ```

3. En EasyPanel:
   - Source: Docker Image
   - Image: `tu-dockerhub-usuario/nestjs-crm-shopify:latest`
   - Configura las mismas variables de entorno

## Verificar la instalación

Una vez desplegado, puedes verificar que funciona accediendo a:

- `https://tu-dominio/` - Debe mostrar "API CRM Shopify - NestJS funcionando correctamente!"
- `https://tu-dominio/health` - Debe mostrar el estado de la aplicación
- `https://tu-dominio/products` - Lista de productos (inicialmente vacía)

## Probar la API

### Crear un producto:
```bash
curl -X POST https://tu-dominio/products \
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
curl https://tu-dominio/products
```

## Notas importantes

- La base de datos ya está configurada en tu proyecto (db-shopify)
- La aplicación se conectará automáticamente usando el nombre del servicio interno
- El puerto interno es 5432 para PostgreSQL (no uses el puerto externo 5437)
- La tabla de productos se creará automáticamente al iniciar la aplicación
