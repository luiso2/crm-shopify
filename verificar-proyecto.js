// 🔍 SCRIPT DE VERIFICACIÓN DEL PROYECTO CRM-SHOPIFY
// Ejecutar este código al inicio de cada sesión para verificar el estado

async function verificarProyecto() {
    console.log("🔍 VERIFICACIÓN DEL PROYECTO CRM-SHOPIFY");
    console.log("========================================\n");
    
    let todoOk = true;
    
    // 1. Verificar Backend en Producción
    console.log("1️⃣ Verificando Backend en Vercel...");
    try {
        const healthCheck = await api_manager.test_api({
            api_name: "crm-backend-shopify",
            endpoint: "/health",
            method: "GET"
        });
        
        if (healthCheck.status === 200) {
            console.log("✅ Backend funcionando correctamente");
            console.log(`   Status: ${healthCheck.data.status}`);
            console.log(`   Uptime: ${Math.round(healthCheck.data.uptime)}s`);
        } else {
            console.log("❌ Backend no responde correctamente");
            todoOk = false;
        }
    } catch (error) {
        console.log("❌ Error al conectar con el backend:", error.message);
        todoOk = false;
    }
    
    // 2. Verificar Conexión a Base de Datos
    console.log("\n2️⃣ Verificando Base de Datos PostgreSQL...");
    try {
        await postgres_db_sleep.connect_db({
            host: "168.231.92.67",
            port: 5437,
            database: "db-shopify",
            user: "postgres",
            password: "Atec2019chino"
        });
        
        const testQuery = await postgres_db_sleep.query({
            sql: "SELECT COUNT(*) as total FROM products"
        });
        
        console.log("✅ Conexión a DB exitosa");
        console.log(`   Productos en DB: ${testQuery[0].total}`);
        
        // Verificar tablas principales
        const tables = await postgres_db_sleep.list_tables();
        console.log(`   Total de tablas: ${tables.length}`);
    } catch (error) {
        console.log("❌ Error al conectar con la base de datos:", error.message);
        todoOk = false;
    }
    
    // 3. Verificar API de Vercel
    console.log("\n3️⃣ Verificando API de Vercel...");
    try {
        const vercelStatus = await api_manager.test_api({
            api_name: "vercel",
            endpoint: "/v10/projects/prj_GRCuvqJvKPH2SuYN7OX85ZRVwSC0",
            method: "GET"
        });
        
        if (vercelStatus.status === 200) {
            console.log("✅ Conexión con Vercel API correcta");
            console.log(`   Proyecto: ${vercelStatus.data.name}`);
            console.log(`   Estado: ${vercelStatus.data.live ? 'Live' : 'Not Live'}`);
        }
    } catch (error) {
        console.log("❌ Error al conectar con Vercel API:", error.message);
        todoOk = false;
    }
    
    // 4. Verificar Archivos del Proyecto
    console.log("\n4️⃣ Verificando archivos del proyecto...");
    try {
        const archivosImportantes = [
            "C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel\\src\\main.ts",
            "C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel\\vercel.json",
            "C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel\\package.json"
        ];
        
        let archivosOk = true;
        for (const archivo of archivosImportantes) {
            try {
                await filesystem.get_file_info({ path: archivo });
            } catch {
                console.log(`❌ Archivo no encontrado: ${archivo}`);
                archivosOk = false;
            }
        }
        
        if (archivosOk) {
            console.log("✅ Todos los archivos principales existen");
        }
    } catch (error) {
        console.log("❌ Error al verificar archivos:", error.message);
    }
    
    // 5. Verificar Git
    console.log("\n5️⃣ Verificando estado de Git...");
    try {
        const gitStatus = await desktop_commander.start_process({
            command: "cd C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel && git status --short",
            timeout_ms: 5000
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const output = await desktop_commander.read_process_output({
            pid: gitStatus.pid,
            timeout_ms: 3000
        });
        
        if (output.output.trim() === "") {
            console.log("✅ Repositorio Git limpio (sin cambios pendientes)");
        } else {
            console.log("⚠️  Hay cambios pendientes en Git:");
            console.log(output.output);
        }
    } catch (error) {
        console.log("⚠️  No se pudo verificar el estado de Git");
    }
    
    // Resumen Final
    console.log("\n========================================");
    if (todoOk) {
        console.log("✅ PROYECTO FUNCIONANDO CORRECTAMENTE");
    } else {
        console.log("⚠️  HAY PROBLEMAS QUE REQUIEREN ATENCIÓN");
    }
    console.log("========================================\n");
    
    // URLs importantes
    console.log("📌 URLs IMPORTANTES:");
    console.log("- Backend API: https://crm-backend-shopify.vercel.app/api");
    console.log("- GitHub: https://github.com/luiso2/crm-shopify");
    console.log("- Vercel Dashboard: https://vercel.com/mercatops-projects/crm-backend-shopify");
    console.log("- Carpeta Local: C:\\Users\\Andybeats\\Desktop\\nestjs-easypanel");
    
    return todoOk;
}

// Ejecutar verificación
await verificarProyecto();
