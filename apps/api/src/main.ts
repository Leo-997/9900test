import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';

import { NestExpressApplication } from '@nestjs/platform-express';
import { ErrorsInterceptor } from 'Interceptors/DomainError.interceptor';
import { normalizePort } from 'Utilities/misc/normalizePort.util';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const PORT: number = normalizePort(
    process.env.PORT_API,
    3001,
  );

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // const config = new DocumentBuilder()
  //   .setTitle('Zero Dash API')
  //   .setDescription('Auto-generated OpenAPI spec for zero-dash-api')
  //   .setVersion('1.0.0')
  //   .addBearerAuth()
  //   .build();

  // const document = SwaggerModule.createDocument(app, config, {
  //   extraModels: [], // register interface-based schemas here via ApiExtraModels if needed
  // });

  app.enableCors({ credentials: true });
  app.use(helmet());
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'tiny'));

  // Extend limit to 20mb for large payloads such as base64 image data
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

  app.set('query parser', 'extended');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ErrorsInterceptor());

  // if (process.env.NODE_ENV !== 'production') {
  //   SwaggerModule.setup('swagger', app, document);
  // }

  await app.listen(PORT, '0.0.0.0');

  console.log(`Zero Dash API application running on port ${PORT}`);
}

bootstrap();
