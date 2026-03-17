import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';

import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'Modules/app.module';
import { ErrorsInterceptor } from './Interceptors/DomainError.interceptor';
import { normalizePort } from './Utils/port.util';

async function bootstrap(): Promise<void> {
  const PORT: number = normalizePort(process.env.PORT_REPORTS, 3001);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ credentials: true });
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
  }
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

  app.setGlobalPrefix('reports');
  await app.listen(PORT);

  const logger = new Logger();
  logger.log(`Application running on port ${PORT}`);
}
bootstrap();
