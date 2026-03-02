import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_hts_drugstats',
    function createHtsDrugstatsTbl(table) {
      table.string('hts_id', 50).notNullable();
      table.string('sample_id', 150).defaultTo(null);
      table.integer('drug_id', 11).unsigned().notNullable();

      table.boolean('hit').defaultTo(null);
      table.double('auc_patient').defaultTo(null);
      table.double('auc_median').defaultTo(null);
      table.double('ic50_patient').defaultTo(null);
      table.double('ic50_median').defaultTo(null);
      table.double('ln50_patient').defaultTo(null);
      table.double('ln50_median').defaultTo(null);
      table.double('zscore_auc').defaultTo(null);
      table.double('zscore_ic50').defaultTo(null);
      table.string('maximum_effect_mtc', 50).defaultTo(null);

      table.string('reportable').defaultTo(null);
      table.text('curator_summary');
      table.text('comments');
      table.text('recommendation');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.primary(['hts_id', 'drug_id']);
      table.unique([`sample_id`, `drug_id`]);

      table.index('hts_id');
      table
        .foreign('hts_id')
        .references('hts_id')
        .inTable('zcc_hts_culture')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.index('drug_id');
      table
        .foreign('drug_id')
        .references('drug_id')
        .inTable('zcc_drugs')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.index('sample_id');
      table
        .foreign('sample_id')
        .references('sample_id')
        .inTable('zcc_sample')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
