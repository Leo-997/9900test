import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_rna_pathways', async (table) => {
    table.string('biosample_id', 150).after('rnaseq_id');

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex
        .update({
          biosample_id: knex.raw('rnaseq_id'),
        })
        .from('zcc_rna_pathways')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_rna_pathways', (table) => {
        table.dropPrimary();
        table.primary(['biosample_id', 'pathway_id']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_rna_pathways', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_rna_pathways', (table) => {
        table.dropColumn('rnaseq_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
