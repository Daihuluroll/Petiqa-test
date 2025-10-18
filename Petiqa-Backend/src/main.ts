import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());

  const globalPrefix = configService.get<string>('globalPrefix') || 'petiqa';
  app.setGlobalPrefix(globalPrefix);

  const swaggerEnabled = configService.get<boolean>('swagger.enabled');
  if (swaggerEnabled) {
    const swaggerUser = configService.get<string>('swagger.username') ?? 'admin';
    const swaggerPassword =
      configService.get<string>('swagger.password') ?? 'admin';

    app.use(
      [`/${globalPrefix}/docs`, `/${globalPrefix}/docs-json`],
      basicAuth({
        challenge: true,
        users: {
          [swaggerUser]: swaggerPassword,
        },
      }),
    );

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Petiqa API')
      .setDescription('Standalone Petiqa backend service')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-app-id',
          in: 'header',
        },
        'app-id',
      )
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${globalPrefix}/docs`, app, swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
}

bootstrap();
