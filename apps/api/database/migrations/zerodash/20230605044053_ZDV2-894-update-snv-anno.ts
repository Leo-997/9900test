import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_snv_anno', (table) => {
    table.double('germline_helium_score').defaultTo(null);
    table.string('germline_helium_reason', 500).defaultTo(null);
    table.boolean('pecan').after('pfam_description').defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
}
