import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_tumour_profile_settings', (table) => {
    table.uuid('clinical_version_id').primary();
    table.boolean('show_mutburden').defaultTo(true);
    table.boolean('show_ipass').defaultTo(true);
    table.boolean('show_purity').defaultTo(true);
    table.boolean('show_msi').defaultTo(true);
    table.boolean('show_loh').defaultTo(true);
    table.boolean('show_ploidy').defaultTo(true);

    table.foreign('clinical_version_id')
      .references('id')
      .inTable('zcc_clinical_versions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
