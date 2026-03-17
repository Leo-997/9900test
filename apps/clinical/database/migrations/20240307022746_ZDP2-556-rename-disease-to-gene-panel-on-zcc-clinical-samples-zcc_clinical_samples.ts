import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_samples', async (table) => {
    table.string('gene_panel').after('cancer_subtype');
  })
    .then(() => (
      knex
        .update({
          gene_panel: knex.raw('disease'),
        })
        .from('zcc_clinical_samples')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_samples', (table) => {
        table.dropColumn('disease');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
