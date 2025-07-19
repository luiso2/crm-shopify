# 🔧 GUÍA DE USO DE MCPs PARA EL PROYECTO CRM-SHOPIFY

## 📌 INICIO RÁPIDO PARA CLAUDE

Cuando empieces una nueva sesión, estos son los pasos recomendados:

### 1. Verificar Estado del Proyecto
```javascript
// Verificar que el backend esté funcionando
await api_manager.test_api({
  api_name: "crm-backend-shopify",
  endpoint: "/health",
  method: "GET"
});

// Conectar a la base de datos
await postgres_db_sleep.connect_db({
  host: "168.231.92.67",
  port: 5437,
  database: "db-shopify",
  user: "postgres",
  password: "Atec2019chino"
});
```

## 🛠️ EJEMPLOS PRÁCTICOS DE USO

### API Manager - Probar Backend

#### Listar Productos
```javascript
await api_manager.test_api({
  api_name: "crm-backend-shopify",
  endpoint: "/products",
  method: "GET"
});
```

#### Crear Producto
```javascript
await api_manager.test_api({
  api_name: "crm-backend-shopify",
  endpoint: "/products",
  method: "POST",
  body: {
    name: "Nuevo Producto",
    description: "Descripción del producto",
    price: 99.99,
    stock: 100
  }
});
```

#### Actualizar Producto
```javascript
await api_manager.test_api({
  api_name: "crm-backend-shopify",
  endpoint: "/products/1",
  method: "PUT",
  body: {
    name: "Producto Actualizado",
    price: 149.99
  }
});
```

### PostgreSQL - Consultas a Base de Datos

#### Ver Estructura de Tablas
```javascript
// Listar todas las tablas
await postgres_db_sleep.list_tables();

// Ver estructura de una tabla
await postgres_db_sleep.describe_table({ 
  table: "shopify_orders" 
});
```

#### Consultas de Análisis
```javascript
// Contar productos
await postgres_db_sleep.query({
  sql: "SELECT COUNT(*) as total FROM products"
});

// Productos con bajo stock
await postgres_db_sleep.query({
  sql: "SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC"
});

// Órdenes recientes de Shopify
await postgres_db_sleep.query({
  sql: `
    SELECT id, orderNumber, totalPrice, status, createdAt 
    FROM shopify_orders 
    ORDER BY createdAt DESC 
    LIMIT 10
  `
});

// Clientes más activos
await postgres_db_sleep.query({
  sql: `
    SELECT customerId, COUNT(*) as total_orders, SUM(totalPrice::numeric) as total_spent
    FROM shopify_orders
    GROUP BY customerId
    ORDER BY total_spent DESC
    LIMIT 10
  `
});
```

#### Modificar Datos
```javascript
// Insertar producto
await postgres_db_sleep.execute({
  sql: `
    INSERT INTO products (name, description, price, stock) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `,
  params: ["Producto Test", "Descripción", 99.99, 50]
});

// Actualizar stock
await postgres_db_sleep.execute({
  sql: "UPDATE products SET stock = stock - $1 WHERE id = $2",
  params: [5, 1]
});
```

### Desktop Commander - Desarrollo Local

#### Gestión del Proyecto
```javascript
// Ver estado de Git
await desktop_commander.start_process({
  command: "cd C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel && git status",
  timeout_ms: 5000
});

// Instalar dependencias
await desktop_commander.start_process({
  command: "cd C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel && npm install",
  timeout_ms: 60000
});

// Ejecutar en desarrollo
await desktop_commander.start_process({
  command: "cd C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel && npm run start:dev",
  timeout_ms: 10000
});
```

#### Deploy con Vercel CLI
```javascript
// Deploy a producción
await desktop_commander.start_process({
  command: "cd C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel && vercel --prod",
  timeout_ms: 180000
});

// Ver logs de Vercel
await desktop_commander.start_process({
  command: "vercel logs crm-backend-shopify --follow",
  timeout_ms: 30000
});
```

### Filesystem - Gestión de Archivos

#### Leer Archivos del Proyecto
```javascript
// Leer configuración
await filesystem.read_file({
  path: "C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel\\src\\app.module.ts"
});

// Leer múltiples archivos
await filesystem.read_multiple_files({
  paths: [
    "C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel\\src\\main.ts",
    "C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel\\vercel.json",
    "C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel\\package.json"
  ]
});
```

#### Crear Nuevos Módulos
```javascript
// Crear directorio para nuevo módulo
await filesystem.create_directory({
  path: "C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel\\src\\orders"
});

// Crear archivo de entidad
await filesystem.write_file({
  path: "C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel\\src\\orders\\order.entity.ts",
  content: `
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column()
  status: string;

  @Column('jsonb', { nullable: true })
  items: any;

  @CreateDateColumn()
  createdAt: Date;
}
  `
});
```

### Vercel API - Gestión de Deployments

#### Ver Estado del Proyecto
```javascript
await api_manager.test_api({
  api_name: "vercel",
  endpoint: "/v10/projects/prj_GRCuvqJvKPH2SuYN7OX85ZRVwSC0",
  method: "GET"
});
```

#### Actualizar Variables de Entorno
```javascript
await api_manager.test_api({
  api_name: "vercel",
  endpoint: "/v10/projects/prj_GRCuvqJvKPH2SuYN7OX85ZRVwSC0/env",
  method: "POST",
  body: [
    {
      key: "NEW_ENV_VAR",
      value: "valor_secreto",
      type: "encrypted",
      target: ["production", "preview", "development"]
    }
  ]
});
```

## 📊 FLUJOS DE TRABAJO COMPLETOS

### Agregar Nueva Funcionalidad

1. **Crear archivos localmente**
```javascript
// Crear entidad
await filesystem.write_file({ 
  path: "...", 
  content: "..." 
});
```

2. **Probar localmente**
```javascript
// Iniciar servidor de desarrollo
await desktop_commander.start_process({
  command: "npm run start:dev",
  timeout_ms: 10000
});

// Probar endpoint
await api_manager.test_api({
  api_name: "local-backend",
  endpoint: "/new-endpoint",
  method: "GET"
});
```

3. **Verificar base de datos**
```javascript
// Ver si la tabla se creó
await postgres_db_sleep.list_tables();

// Verificar estructura
await postgres_db_sleep.describe_table({ 
  table: "nueva_tabla" 
});
```

4. **Commit y deploy**
```javascript
// Git commit
await desktop_commander.start_process({
  command: "git add . && git commit -m 'Add new feature'",
  timeout_ms: 10000
});

// Push a GitHub
await desktop_commander.start_process({
  command: "git push origin master",
  timeout_ms: 30000
});

// O deploy directo con Vercel
await desktop_commander.start_process({
  command: "vercel --prod",
  timeout_ms: 180000
});
```

5. **Verificar en producción**
```javascript
await api_manager.test_api({
  api_name: "crm-backend-shopify",
  endpoint: "/new-endpoint",
  method: "GET"
});
```

### Debugging de Problemas

#### Si el backend no responde:
```javascript
// 1. Verificar logs de Vercel
await desktop_commander.start_process({
  command: "vercel logs crm-backend-shopify",
  timeout_ms: 10000
});

// 2. Verificar conexión a DB
await postgres_db_sleep.query({
  sql: "SELECT 1"
});

// 3. Revisar estado en Vercel Dashboard
await api_manager.test_api({
  api_name: "vercel",
  endpoint: "/v10/projects/prj_GRCuvqJvKPH2SuYN7OX85ZRVwSC0",
  method: "GET"
});
```

## 🔑 VARIABLES Y CONSTANTES IMPORTANTES

```javascript
// IDs del Proyecto
const PROJECT_ID = "prj_GRCuvqJvKPH2SuYN7OX85ZRVwSC0";
const GITHUB_REPO = "https://github.com/luiso2/crm-shopify";
const PROJECT_PATH = "C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel";

// URLs de Producción
const API_URL = "https://crm-backend-shopify.vercel.app/api";
const VERCEL_DASHBOARD = "https://vercel.com/mercatops-projects/crm-backend-shopify";

// Conexión DB Producción
const DB_CONFIG = {
  host: "168.231.92.67",
  port: 5437,
  database: "db-shopify",
  username: "postgres",
  password: "Atec2019chino"
};

// APIs Configuradas en API Manager
const APIS = {
  backend: "crm-backend-shopify",
  vercel: "vercel",
  shopify: "shopify",
  easypanel: "easypanel"
};
```

## 💡 TIPS Y MEJORES PRÁCTICAS

1. **Siempre verificar** el estado del backend antes de hacer cambios
2. **Probar localmente** antes de hacer deploy
3. **Usar transacciones** para operaciones críticas en la DB
4. **Revisar logs** de Vercel si algo falla
5. **Hacer backups** de la DB antes de cambios mayores
6. **Documentar** nuevos endpoints y cambios
7. **Mantener** las variables de entorno actualizadas

---

**Este documento debe ser la primera referencia al iniciar cualquier sesión de desarrollo**
