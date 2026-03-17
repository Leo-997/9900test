import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';

import { ValidationPipe } from '@nestjs/common';
import { ErrorsInterceptor } from './Interceptors/DomainError.interceptor';
import { AppModule } from './Modules/app.module';

async function bootstrap(): Promise<void> {
  const PORT: number = parseInt(process.env.PORT_EVIDENCE || '3001', 10);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ credentials: true });
  app.use(helmet());
  app.use(compression());
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

  app.setGlobalPrefix('evidence');
  await app.listen(PORT);

  // eslint-disable-next-line no-console
  console.log(`Evidences API application running on port ${PORT}`);
}
bootstrap();
