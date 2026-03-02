import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_armcnv', (table) => {
    // drops keys
    table.dropForeign('biosample_id', 'zcc_curated_sample_somatic_armcnv_biosample_id_foreign');
    table.dropPrimary();

    // add keys
    table.primary(['biosample_id', 'chr', 'arm']);
    table
      .foreign('biosample_id')
      .references('zcc_biosample.biosample_id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
}
