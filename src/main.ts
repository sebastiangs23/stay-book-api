import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { securityMiddleware } from './common/middlewares/security.middleware';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);
  app.use(securityMiddleware);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // removes properties not in DTO
      forbidNonWhitelisted: true, // throws error if extra fields are sent
      transform: true, // converts payload types automatically
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('StayBook API')
    .setDescription('Hotel room booking platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
