/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import { ConfigService } from '@nestjs/config';
import { AnalysisSetsClient } from 'Clients/Analysis/AnalysisSets.client';
import configuration from 'Config/configuration';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import knex from 'knex';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import xlsx from 'node-xlsx';
import { knexConnectionConfig } from '../../../knexfile';

dayjs.extend(customParseFormat);

const FILE_NAME = `${__dirname}/../../../input/mtb_meeting_dates.xlsx`;

const zdKnex = knex(knexConnectionConfig);
const parsed = xlsx.parse(FILE_NAME);

const analysisSetClient = new AnalysisSetsClient(
  zdKnex,
  new ConfigService(configuration()),
);

async function run(): Promise<void> {
  for (const [,, biosampleId, date] of parsed[0].data.slice(1)) {
    const analysisSet = await analysisSetClient.getAnalysisSets({
      search: [biosampleId],
      page: 1,
      limit: 1,
    }, { id: '1' } as IUserWithMetadata);
    if (analysisSet[0]?.analysisSetId) {
      const clinicalVersion = await zdKnex
        .select({
          clinicalVersionId: 'id',
        })
        .from('zccclinical.zcc_clinical_versions')
        .where('analysis_set_id', analysisSet[0]?.analysisSetId)
        .whereNotIn('status', ['Cancelled'])
        .first();

      if (!clinicalVersion) {
        console.log('No clinical version found', analysisSet[0]?.analysisSetId, biosampleId, 'triggering export...');
        await analysisSetClient.triggerExport(analysisSet[0]?.analysisSetId, { type: 'CASE', clinicalStatus: 'Ready to Start' });
      } else {
        // set the mtb date from utc and convert to sydney time
        const mtbDate = dayjs(date, 'D-MMM-YY');
        console.log('Finalising MTB for', biosampleId, clinicalVersion.clinicalVersionId, analysisSet[0]?.analysisSetId, mtbDate.format('DD-MMM-YYYY'), mtbDate.toISOString().slice(0, 19).replace('T', ' '));
        // create meeting record if it doesn't exist
        await zdKnex
          .insert({
            date: mtbDate.format('YYYY-MM-DD'),
          })
          .into('zccclinical.zcc_clinical_meetings')
          .onConflict('date')
          .ignore();

        // add the version to the meeting
        await zdKnex
          .insert({
            meeting_id: zdKnex
              .select('id')
              .from('zccclinical.zcc_clinical_meetings')
              .where('date', mtbDate.format('YYYY-MM-DD'))
              .first(),
            clinical_version_id: clinicalVersion.clinicalVersionId,
            type: 'MTB',
          })
          .into('zccclinical.zcc_clinical_meeting_version_xref')
          .onConflict(['meeting_id', 'clinical_version_id', 'type'])
          .ignore();

        // finalise the version
        await zdKnex
          .update({
            slides_finalised_at: mtbDate.toISOString().slice(0, 19).replace('T', ' '),
            status: 'Done',
          })
          .from('zccclinical.zcc_clinical_versions')
          .where('id', clinicalVersion.clinicalVersionId);
      }
    }
  }

  process.exit(0);
}

run();
