import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_therapies', (table) => {
    table.dropColumn('description');
    table.dropColumn('title');
    table.boolean('chemotherapy').after('id');
    table.string('chemotherapy_note', 1024).after('chemotherapy');
    table.boolean('radiotherapy').after('chemotherapy_note');
    table.string('radiotherapy_note', 1024).after('radiotherapy');
  });
}

export async function down(knex: Knex): Promise<void> {
}
