import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_interpretation_comment', (table) => {
    table.uuid('id').primary();
    table.string('title', 1024).notNullable();
    table.string('clinical_version_id').notNullable();
    table.string('mol_alteration_group_id').notNullable();
    table.integer('order');

    table.foreign('clinical_version_id', 'interpretation_version_id_foreign')
      .references('id')
      .inTable('zcc_clinical_versions')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.foreign('mol_alteration_group_id', 'interpretation_group_id_foreign')
      .references('group_id')
      .inTable('zcc_clinical_mol_alterations_group')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
