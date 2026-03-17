import { S3Client } from '@aws-sdk/client-s3';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { normalizeString } from 'Config/configuration';
import { S3CLIENT } from './S3.constant';
import { S3Service } from './S3.service';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    S3Service,
    {
      provide: S3CLIENT,
      useValue: new S3Client({
        credentials: {
          accessKeyId: normalizeString(process.env.AWS_ACCESS_KEY_ID),
          secretAccessKey: normalizeString(process.env.AWS_SECRET_ACCESS_KEY),
        },
        region: normalizeString(process.env.AWS_REGION),
        endpoint: normalizeString(process.env.AWS_ENDPOINT),
        forcePathStyle: true,
      }),
    },
  ],
  exports: [S3Service],
})
export class S3Module {}
