# 🔍 CÓDIGO DE VERIFICACIÓN PARA CLAUDE

Copia y ejecuta este código en Claude para verificar el estado del proyecto:

```javascript
// VERIFICACIÓN COMPLETA DEL PROYECTO CRM-SHOPIFY

console.log("🔍 VERIFICANDO PROYECTO CRM-SHOPIFY...\n");

// 1. Backend
console.log("1️⃣ Verificando Backend...");
const health = await api_manager.test_api({
  api_name: "crm-backend-shopify",
  endpoint: "/health",
  method: "GET"
});
console.log("✅ Backend:", health.status === 200 ? "OK" : "ERROR");

// 2. Base de Datos
console.log("\n2️⃣ Conectando a Base de Datos...");
await postgres_db_sleep.connect_db({
  host: "168.231.92.67",
  port: 5437,
  database: "db-shopify",
  user: "postgres",
  password: "Atec2019chino"
});
console.log("✅ DB conectada");

// 3. Contar registros
const productos = await postgres_db_sleep.query({
  sql: "SELECT COUNT(*) as total FROM products"
});
console.log(`✅ Productos en DB: ${productos[0].total}`);

// 4. Verificar Vercel
console.log("\n3️⃣ Verificando Vercel...");
const vercel = await api_manager.test_api({
  api_name: "vercel",
  endpoint: "/v10/projects/prj_GRCuvqJvKPH2SuYN7OX85ZRVwSC0",
  method: "GET"
});
console.log("✅ Vercel:", vercel.status === 200 ? "OK" : "ERROR");

console.log("\n✅ VERIFICACIÓN COMPLETA");
console.log("========================");
console.log("📌 Backend: https://crm-backend-shopify.vercel.app/api");
console.log("📌 GitHub: https://github.com/luiso2/crm-shopify");
console.log("📌 Local: C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel");
```

## COMANDOS ÚTILES ADICIONALES

### Listar productos
```javascript
await api_manager.test_api({
  api_name: "crm-backend-shopify",
  endpoint: "/products",
  method: "GET"
});
```

### Ver últimas órdenes de Shopify
```javascript
await postgres_db_sleep.query({
  sql: "SELECT id, orderNumber, totalPrice, createdAt FROM shopify_orders ORDER BY createdAt DESC LIMIT 5"
});
```

### Crear producto de prueba
```javascript
await api_manager.test_api({
  api_name: "crm-backend-shopify",
  endpoint: "/products",
  method: "POST",
  body: {
    name: "Producto Test",
    description: "Creado desde Claude",
    price: 99.99,
    stock: 10
  }
});
```

### Ver estado de Git
```javascript
await desktop_commander.start_process({
  command: "cd C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel && git status",
  timeout_ms: 5000
});
```

### Deploy a producción
```javascript
await desktop_commander.start_process({
  command: "cd C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel && vercel --prod",
  timeout_ms: 180000
});
```
