import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_methylation_predictions',
    function createMethylationPredictionsTbl(table) {
      table.string('sample_id', 150).notNullable();
      table.string('meth_class_id', 50).notNullable();
      table.specificType('meth_class_score', 'double').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.primary(['sample_id', 'meth_class_id']);
      table.index('meth_class_id');
      table.index('sample_id');

      table
        .foreign('meth_class_id')
        .references('zcc_methylation_xref.meth_class_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table
        .foreign('sample_id')
        .references('zcc_sample.sample_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
