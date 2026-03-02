import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_non_gene_mol_alterations_settings', (table) => {
    table.string('id').primary().notNullable();
    table.string('clinical_version_id')
      .notNullable()
      .unique({ indexName: 'zcc_clinical_ng_mol_alt_settings_clinical_version_unique' });
    table.boolean('show_alteration').defaultTo(true);
    table.boolean('show_description').defaultTo(true);
    table.boolean('show_reported_as').defaultTo(false);
    table.boolean('show_targeted').defaultTo(true);
    table.boolean('show_clinical_notes').defaultTo(true);
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.string('updated_by').nullable();

    table.index('clinical_version_id', 'clinical_version_id_mol');

    table
      .foreign('clinical_version_id', 'clinical_version_id_mol')
      .references('zcc_clinical_versions.id')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
