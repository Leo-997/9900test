import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_methylation_probe', (table) => {
    table.renameColumn('gencodebasicv12_name', 'gencodebasic_name');
    table.renameColumn('gencodebasicv12_accession', 'gencodebasic_accession');
    table.string('probe_match', 50).nullable();
    table.unique(['probe_id', 'platform_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
}
