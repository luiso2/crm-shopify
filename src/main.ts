import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let app;

async function bootstrap() {
  app = await NestFactory.create(AppModule);
  
  // Configurar CORS para aceptar solicitudes desde cualquier origen
  app.enableCors({
    origin: true, // Acepta cualquier origen
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Configurar el prefijo global para la API
  app.setGlobalPrefix('api');
  
  // Puerto desde variable de entorno o 3000 por defecto
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  
  return app;
}

// Para Vercel
if (process.env.VERCEL) {
  module.exports = bootstrap();
} else {
  bootstrap();
}

// Exportar para serverless
export default async (req, res) => {
  if (!app) {
    app = await bootstrap();
  }
  return app.getHttpAdapter().getInstance()(req, res);
};
