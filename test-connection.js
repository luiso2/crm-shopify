// Script de prueba para verificar la conexión a la base de datos
// Ejecutar con: node test-connection.js

const { Client } = require('pg');

// Configuración para conexión local (desde tu PC)
const localConfig = {
  host: '168.231.92.67',
  port: 5437,
  user: 'postgres',
  password: 'Atec2019chino',
  database: 'db-shopify',
};

// Configuración para conexión desde EasyPanel (interna)
const easyPanelConfig = {
  host: 'db-shopify',
  port: 5432,
  user: 'postgres',
  password: 'Atec2019chino',
  database: 'db-shopify',
};

async function testConnection(config, name) {
  const client = new Client(config);
  
  try {
    console.log(`\nProbando conexión ${name}...`);
    await client.connect();
    console.log('✅ Conexión exitosa!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Hora del servidor:', result.rows[0].now);
    
    await client.end();
  } catch (error) {
    console.error(`❌ Error en conexión ${name}:`, error.message);
  }
}

// Probar ambas conexiones
(async () => {
  await testConnection(localConfig, 'LOCAL');
  // Descomentar la siguiente línea cuando esté en EasyPanel
  // await testConnection(easyPanelConfig, 'EASYPANEL');
})();
