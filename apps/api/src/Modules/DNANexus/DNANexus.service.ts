/* eslint-disable @typescript-eslint/naming-convention */
import { ConfigService } from '@nestjs/config';
import { Injectable, Inject, Global } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { HttpService } from '@nestjs/axios';

@Injectable()
@Global()
export class DNANexusService {
  constructor(
    private httpService: HttpService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  private readonly dnanexusEndpoint = 'https://api.dnanexus.com';

  public async getDNANexusUrl(
    fileId: string,
    project: string,
    fileName: string,
  ): Promise<string> {
    const token = this.configService.get('dnanexus.token');

    try {
      return await this.httpService.post(
        `${this.dnanexusEndpoint}/${fileId}/download`,
        {
          duration: 60 * 60, // 1 hour
          preauthenticated: true,
          project,
          filename: fileName,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Connection: 'keep-alive',
          },
        },
      ).pipe(
        map((resp) => resp.data),
      ).toPromise();
    } catch (err) {
      console.error(err);
    }
  }
}
