import type { Knex } from "knex";

type PredictionRow = {
  prediction: string;
}

const classificationTable = 'zcc_curated_sample_somatic_rnaseq_classification';
const predictionsTable = 'zcc_rna_classification_predictions';

export async function up(knex: Knex): Promise<void> {
  const distinctPredictions: PredictionRow[] = await knex
    .distinct('prediction')
    .from(classificationTable)
    .whereNotNull('prediction');
  
  await knex
    .insert(distinctPredictions)
    .into(predictionsTable);

  await knex.schema.alterTable(classificationTable, (table) => {
    table
      .foreign('prediction')
      .references('prediction')
      .inTable(predictionsTable)
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .withKeyName('fk_zcc_rnaseq_classification_prediction')
  });
}


export async function down(knex: Knex): Promise<void> {
}

