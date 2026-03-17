import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curation_therapy_drugs',
    (table) => {
      table.uuid('id').primary();
      table.uuid('therapy_id')
        .references('id')
        .inTable('zcc_curation_therapies')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.uuid('external_drug_class_id').index();
      table.uuid('external_drug_version_id').index();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.timestamp('updated_at');
      table.string('updated_by');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {
}
