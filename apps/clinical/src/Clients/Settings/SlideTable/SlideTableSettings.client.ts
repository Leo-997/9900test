import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ISlideTableSettings } from 'Models';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';

@Injectable()
export class SlideTableSettingsClient {
  private readonly settings = 'zcc_clinical_slide_table_settings';

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public async getSettings(clinicalVersionId: string): Promise<ISlideTableSettings> {
    const row = await this.knex(this.settings)
      .select('settings')
      .where('clinical_version_id', clinicalVersionId)
      .first();
    return row ? row.settings : {};
  }

  public async upsertSettings(
    clinicalVersionId: string,
    settings: ISlideTableSettings,
  ): Promise<void> {
    await this.knex(this.settings)
      .insert({
        clinical_version_id: clinicalVersionId,
        settings: JSON.stringify(settings),
      })
      .onConflict('clinical_version_id')
      .merge({
        settings: JSON.stringify(settings),
      });
  }
}
