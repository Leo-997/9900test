/* eslint-disable no-await-in-loop */
import { BiosamplesClient } from 'Clients/Analysis/Biosamples.client';
import knex, { Knex } from 'knex';
import { getBiosample } from 'Utilities/helpers/getBiosample';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { knexConnectionConfig } from '../../../knexfile';

const user: IUserWithMetadata = {
  id: 'sysadmin',
  azureId: '',
  email: 'test@test.com',
  givenName: 'System',
  familyName: 'Admin',
  groups: [],
  roles: [],
  scopes: [],
  accessControls: [],
};

export default async function updateReportableVariantBiosampleId(
  inputKnex?: Knex,
): Promise<void> {
  const zdKnex = knex(knexConnectionConfig);
  const db = inputKnex || zdKnex;
  const biosampleClient = new BiosamplesClient(db);

  // get all the comment threads
  const reportableVariants = await db
    .distinct({
      analysisSetId: 'analysis_set_id',
      variantType: 'variant_type',
      variantId: 'variant_id',
    })
    .from('zcc_curated_reportable_variants')
    .whereNotNull('analysis_set_id');

  for (const rv of reportableVariants) {
    try {
      const biosamples = await biosampleClient.getBiosamples(
        { analysisSetId: rv.analysisSetId },
        user,
        true,
      );

      const biosample = await getBiosample(
        rv.variantType,
        rv.analysisSetId,
        biosamples,
        rv.variantId,
        { reportable: true },
      );
      if (biosample) {
        console.log(`Adding ${biosample.biosampleId} to reportable variant ${rv.analysisSetId}, ${rv.variantType}, ${rv.variantId}`);
        await db
          .update({ biosample_id: biosample?.biosampleId })
          .from('zcc_curated_reportable_variants')
          .where({
            analysis_set_id: rv.analysisSetId,
            variant_type: rv.variantType,
            variant_id: rv.variantId,
          });
      }
    } catch (e) {
      console.log(e);
    }
  }
  // Uncomment when not running via migration
  // process.exit(0);
}

// Uncomment when not running via migration
// updateReportableVariantBiosampleId();
