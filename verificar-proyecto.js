// 🔍 SCRIPT DE VERIFICACIÓN DEL PROYECTO CRM-SHOPIFY
// Este script es para ser ejecutado dentro de Claude usando los MCPs
// No es un script de Node.js independiente

console.log("📌 INSTRUCCIONES DE USO");
console.log("====================");
console.log("Este script debe ser ejecutado dentro de Claude.");
console.log("");
console.log("Para verificar el proyecto, copia y ejecuta el siguiente código:");
console.log("");
console.log("```javascript");
console.log("// 1. Verificar Backend");
console.log('await api_manager.test_api({');
console.log('  api_name: "crm-backend-shopify",');
console.log('  endpoint: "/health",');
console.log('  method: "GET"');
console.log('});');
console.log("");
console.log("// 2. Verificar Base de Datos");
console.log('await postgres_db_sleep.connect_db({');
console.log('  host: "168.231.92.67",');
console.log('  port: 5437,');
console.log('  database: "db-shopify",');
console.log('  user: "postgres",');
console.log('  password: "Atec2019chino"');
console.log('});');
console.log("");
console.log("// 3. Contar productos");
console.log('await postgres_db_sleep.query({');
console.log('  sql: "SELECT COUNT(*) as total FROM products"');
console.log('});');
console.log("```");
console.log("");
console.log("URLs IMPORTANTES:");
console.log("- Backend: https://crm-backend-shopify.vercel.app/api");
console.log("- GitHub: https://github.com/luiso2/crm-shopify");
console.log("- Vercel: https://vercel.com/mercatops-projects/crm-backend-shopify");
