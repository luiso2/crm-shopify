import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  
  // Configurar CORS para aceptar solicitudes desde cualquier origen
  app.enableCors({
    origin: true, // Acepta cualquier origen
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Configurar el prefijo global para la API
  app.setGlobalPrefix('api');
  
  // Agregar validation pipe global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Puerto desde variable de entorno o 3000 por defecto
  const port = process.env.PORT || 3000;
  
  // Solo iniciar el servidor si no estamos en Vercel
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  }
  
  return app;
}

// Variable para almacenar la instancia
let cachedApp;

// Función para obtener o crear la aplicación
async function getApp() {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp;
}

// Exportar para desarrollo local
if (require.main === module) {
  bootstrap();
}

// Exportar para Vercel
export default async (req, res) => {
  try {
    const app = await getApp();
    const instance = app.getHttpAdapter().getInstance();
    return instance(req, res);
  } catch (error) {
    console.error('Error in Vercel handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
