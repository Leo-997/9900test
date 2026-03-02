import {
  DeleteObjectCommand,
  GetBucketAclCommand,
  GetBucketAclCommandOutput,
  GetObjectCommand, GetObjectCommandOutput, PutObjectCommand, PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPostFileResponse } from 'Models/S3/S3.model';
import { Readable } from 'stream';
import { S3CLIENT } from './S3.constant';

export class S3Service {
  constructor(
    @Inject(S3CLIENT) private readonly s3Client: S3Client,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  public async getS3Url(
    key: string,
    bucket?: string,
    expiresIn = 60 * 60,
    contentDisposition = 'inline',
  ): Promise<string> {
    const params = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Bucket: bucket || this.configService.get('aws.bucket'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Key: key,
      contentDisposition,
    };
    const command = new GetObjectCommand(params);
    return getSignedUrl(this.s3Client, command, { expiresIn })
      .catch(() => '');
  }

  public async getObject(
    key: string,
    bucket?: string,
  ): Promise<GetObjectCommandOutput> {
    const params = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Bucket: bucket || this.configService.get('aws.bucket'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Key: key,
    };
    const command = new GetObjectCommand(params);
    return this.s3Client.send(command);
  }

  public async postFile(
    key: string,
    file: string | Uint8Array | Buffer | Readable,
    bucket?: string,
  ): Promise<IPostFileResponse> {
    const params: PutObjectCommandInput = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Bucket: bucket || this.configService.get('aws.bucket'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Key: key,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Body: file,
    };
    const command = new PutObjectCommand(params);
    const resp = await this.s3Client.send(command);
    return {
      url: await this.getS3Url(key, bucket),
      etag: resp.ETag,
      bucket: bucket || this.configService.get('aws.bucket'),
    };
  }

  public async deleteObject(
    key: string,
    bucket?: string,
  ): Promise<void> {
    const command = new DeleteObjectCommand({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Bucket: bucket || this.configService.get('aws.bucket'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Key: key,
    });
    await this.s3Client.send(command);
  }

  public async getAccountInfo(bucket: string): Promise<GetBucketAclCommandOutput> {
    const command = new GetBucketAclCommand({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Bucket: bucket,
    });
    return this.s3Client.send(command);
  }
}
