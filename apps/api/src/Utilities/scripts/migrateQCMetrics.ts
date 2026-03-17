import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';



const zdKnex = knex(knexConnectionConfig);
const metricsTable = 'zcc_seq_metrics';
const oldMetricsTable = 'zcc_seq_metrics_deprecated';
const analysisSetXrefTable = 'zcc_analysis_set_biosample_xref';
const biosampleTable = 'zcc_biosample';

async function getBiosampleId(sampleId: string, status: 'tumour' | 'normal' | 'donor'): Promise<Record<'biosample_id', string> | null> {
  // find analysis for the sample id
  const analysisSet = await zdKnex
    .select('analysis_set_id')
    .from({ xref: analysisSetXrefTable })
    .where('biosample_id', sampleId)
    .first();

  if (status === 'tumour') {
    return zdKnex
      .select('biosample.biosample_id')
      .from({ biosample: biosampleTable })
      .where('biosample.biosample_id', sampleId)
      .first();
  }

  if (analysisSet) {
    // find the biosample id with the given status in the same set
    return zdKnex
      .select('biosample.biosample_id')
      .from({ biosample: biosampleTable })
      .innerJoin({ xref: analysisSetXrefTable }, 'biosample.biosample_id', 'xref.biosample_id')
      .where('xref.analysis_set_id', analysisSet.analysis_set_id)
      .andWhere('biosample.biosample_status', status)
      .andWhere('biosample.biosample_type', 'dna')
      .whereIn('biosample.sample_type', ['wgs', 'panel'])
      .first();
  }

  return null;
}

async function migrateQCMetrics(): Promise<void> {
  const oldMetrics = await zdKnex
    .select('*')
    .from({ oldMetrics: oldMetricsTable })
    .orderBy('sample_id');

  await Promise.all(oldMetrics.map((oldMetric) => (
    getBiosampleId(oldMetric.sample_id, oldMetric.sample_type)
      .then((biosampleId) => {
        if (biosampleId) {
          if (biosampleId.biosample_id) {
            console.log(`Migrating ${oldMetric.sample_id}, ${oldMetric.sample_type} to ${biosampleId.biosample_id}`);
            const newMetrics = { ...oldMetric, biosample_id: biosampleId.biosample_id };
            // remove old properties so that they don't get inserted
            delete newMetrics.sample_id;
            delete newMetrics.sample_type;
            delete newMetrics.biomaterial_id;
            return zdKnex
              .insert(newMetrics)
              .into(metricsTable)
              .onConflict(['biosample_id', 'platform_id'])
              .ignore();
          }
        } else {
          console.log('No biosample found for', oldMetric.sample_id, oldMetric.sample_type);
        }
      })
  )));

  process.exit(0);
}

migrateQCMetrics();
