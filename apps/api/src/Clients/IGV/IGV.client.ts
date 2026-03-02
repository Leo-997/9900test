import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  SampleLinks,
  SampleResponse,
} from 'Models/IGV/Requests/IGV.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { FILE_TRACKER_KNEX_CONNECTION } from 'Modules/Knex/constants';
import { S3Service } from 'Modules/S3/S3.service';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';

@Injectable()
export class IGVClient {
  constructor(
    @Inject(FILE_TRACKER_KNEX_CONNECTION) private readonly ftKnex: Knex,
    @Inject(S3Service) private readonly s3: S3Service,
  ) {}

  public async getSampleLinks(
    sampleIds: string[],
    user: IUserWithMetadata,
  ): Promise<SampleResponse> {
    const content: SampleResponse = {
      links: [],
      invalidSamples: [],
    };

    const promises: Promise<void>[] = [];
    for (const id of sampleIds) {
      promises.push(
        this.fetchSampleLinks(
          id,
          user,
        ).then((resp) => {
          if (resp) {
            content.links.push(resp);
          } else {
            content.invalidSamples.push(id);
          }
        }),
      );
    }

    await Promise.all(promises);

    return content;
  }

  private baseLinksQuery(
    id: string,
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.ftKnex
      .select({
        filename: 'd.filename',
        key: 'n.key',
        bucket: 'n.bucket',
      })
      .from({ d: 'datafiles' })
      .leftJoin({ n: 'netapp' }, 'n.file_id', 'd.file_id')
      .leftJoin({ b: 'zcc_zd_bam' }, 'b.file_id', 'd.file_id')
      .modify(withBiosample, 'innerJoin', user, 'd.sample_id')
      .where('biosample.biosample_id', id)
      .andWhere('d.filetype', 'bam')
      .andWhere('d.ref_genome', 'hs38')
      .andWhere('b.assembly', false);
  }

  private async fetchSampleLinks(
    id: string,
    user,
  ): Promise<SampleLinks | null> {
    const expiry = 60 * 60 * 24 * 7; // 7 day expiry
    const resp = await this.baseLinksQuery(id, user).first();

    // No bam file
    if (!resp) {
      return null;
    }

    const pathResp = await this.s3.getS3Url(resp.key, resp.bucket, expiry);
    const indexResp = await this.s3.getS3Url(
      `${resp.key}.bai`,
      resp.bucket,
      expiry,
    );
    let coverageResp: string;
    try {
      coverageResp = await this.s3.getS3Url(`${resp.key}.tdf`, resp.bucket, expiry);
    } catch {
      console.log(`Could not find TDF file for ${resp.key}`);
    }

    return {
      biosampleId: id,
      name: resp.filename,
      pathUrl: pathResp,
      indexUrl: indexResp,
      coverageUrl: coverageResp,
    };
  }
}
