import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_cytobandcnv', async (table) => {
    table.string('biosample_id', 150).after('sample_id');

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex
        .update({
          biosample_id: knex.raw('sample_id'),
        })
        .from('zcc_curated_sample_somatic_cytobandcnv')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_cytobandcnv', (table) => {
        table.dropIndex(['sample_id'], 'zcc_curated_sample_somatic_cytobandcnv_sample_id_index');
        table.dropPrimary();
        table.primary(['biosample_id', 'cytoband']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_cytobandcnv', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_cytobandcnv', (table) => {
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
