import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_mol_alterations_group', (table) => {
    table.string('group_id').primary().notNullable();
    table.string('mol_alteration_id').primary().notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by').notNullable();

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('zcc_clinical_mol_alterations_group');
}
