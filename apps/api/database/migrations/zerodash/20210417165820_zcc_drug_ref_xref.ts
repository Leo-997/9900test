import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    `zcc_drug_ref_xref`,
    function createDrugRefXrefTbl(table) {
      table.integer(`drug_id`, 11).unsigned().notNullable();
      table.integer(`ref_id`, 11).unsigned().notNullable();

      table.primary(['drug_id', 'ref_id']);

      table.index('drug_id');
      table
        .foreign('drug_id')
        .references('drug_id')
        .inTable('zcc_drugs')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.index('ref_id');
      table
        .foreign('ref_id')
        .references('ref_id')
        .inTable('zcc_references')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
