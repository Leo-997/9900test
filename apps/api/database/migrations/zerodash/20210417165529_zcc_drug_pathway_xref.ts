import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    `zcc_drug_pathway_xref`,
    function createDrugPathwayXref(table) {
      table.integer(`drug_id`, 11).unsigned().notNullable();
      table.integer(`pathway_id`, 11).unsigned().notNullable();

      table.primary(['drug_id', 'pathway_id']);

      table.index('drug_id');
      table
        .foreign('drug_id')
        .references('drug_id')
        .inTable('zcc_drugs')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.index('pathway_id');
      table
        .foreign('pathway_id')
        .references('pathway_id')
        .inTable('zcc_pathways')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
