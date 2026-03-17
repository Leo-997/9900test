import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_rna_pathways',
    function createRnaPathwaysTbl(table) {
      table.string('rnaseq_id', 150).notNullable();
      table.integer('pathway_id', 11).unsigned().notNullable();

      table.integer('psize', 11).defaultTo(null);
      table.integer('nde', 11).defaultTo(null);
      table.specificType('pnde', 'double').defaultTo(null);
      table.specificType('ta', 'double').defaultTo(null);
      table.specificType('ppert', 'double').defaultTo(null);
      table.specificType('pg', 'double').defaultTo(null);
      table.specificType('pgfdr', 'double').defaultTo(null);
      table.specificType('pgfwer', 'double').defaultTo(null);
      table.string('status', 50).defaultTo(null);
      table.string('kegglink', 850).defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.primary(['rnaseq_id', 'pathway_id']);

      table.index('pathway_id');
      table
        .foreign('pathway_id')
        .references('zcc_pathways.pathway_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
