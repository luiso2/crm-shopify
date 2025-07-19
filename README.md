# NestJS API para CRM Shopify

## Descripción
API REST construida con NestJS para el sistema CRM Shopify, con conexión a PostgreSQL.

## Endpoints disponibles

### Health Check
- `GET /` - Mensaje de bienvenida
- `GET /health` - Estado de la aplicación

### Products (CRUD completo)
- `GET /products` - Listar todos los productos
- `GET /products/:id` - Obtener un producto por ID
- `POST /products` - Crear un nuevo producto
- `PUT /products/:id` - Actualizar un producto
- `DELETE /products/:id` - Eliminar un producto

## Estructura del producto
```json
{
  "name": "Nombre del producto",
  "description": "Descripción opcional",
  "price": 99.99,
  "stock": 100
}
```

## Instalación local

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en modo desarrollo:
```bash
npm run start:dev
```

## Build para producción

```bash
npm run build
npm run start:prod
```

## Variables de entorno

La aplicación se conecta automáticamente a tu base de datos PostgreSQL en EasyPanel con las siguientes configuraciones:

- `DB_HOST`: db-shopify (nombre del servicio en EasyPanel)
- `DB_PORT`: 5432 (puerto interno)
- `DB_USERNAME`: postgres
- `DB_PASSWORD`: Atec2019chino
- `DB_NAME`: db-shopify

## Despliegue en EasyPanel

Para desplegar esta aplicación en EasyPanel, sigue estos pasos:

### Opción 1: Usando GitHub

1. Sube este código a un repositorio GitHub
2. En EasyPanel, crea una nueva aplicación
3. Selecciona "GitHub" como fuente
4. Proporciona la URL del repositorio
5. EasyPanel construirá y desplegará automáticamente

### Opción 2: Build local y push a Docker Hub

1. Construye la imagen localmente:
```bash
docker build -t tu-usuario/nestjs-crm-shopify .
```

2. Sube la imagen a Docker Hub:
```bash
docker push tu-usuario/nestjs-crm-shopify
```

3. En EasyPanel, crea una aplicación con la imagen de Docker Hub

### Opción 3: Usando el comando de EasyPanel CLI

Si tienes EasyPanel CLI instalado:

```bash
easypanel deploy --project crm-shopify --service api-nestjs
```

## Configuración de red en EasyPanel

La aplicación se conectará automáticamente a la base de datos usando el nombre del servicio interno `db-shopify` en el puerto 5432.

No necesitas usar la IP externa (168.231.92.67) cuando despliegues en EasyPanel, ya que los servicios se comunican internamente.
