import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_drug_details',
    function createZccDrugDetailsTbl(table) {
      table.increments('internal_id');
      table.integer('drug_id', 11).unsigned().notNullable();

      table.enum('screen', ['hts', 'pdx', 'human']).notNullable();
      table.string('dose_pk', 45).defaultTo(null);
      table.string('dose_schedule', 300).defaultTo(null);
      table.string('dose_paediatric', 150).defaultTo(null);
      table.enum('dose_tolerance', ['MTD', 'RD', 'MID']).defaultTo(null);
      table.double('cmax_ng_ml').defaultTo(null);
      table.double('cmax_uM').defaultTo(null);
      table.double('css_ng_ml').defaultTo(null);
      table.double('css_uM').defaultTo(null);
      table.enum('css_peak', ['Peak', 'Trough']).defaultTo(null);
      table.enum('max_response', ['CR', 'SD', 'PR', 'NA']).defaultTo(null);
      table.string('tumor_type', 250).defaultTo(null);
      table.double('crpc_uM').defaultTo(null);
      table.double('crpc_nM').defaultTo(null);
      table.string('bbb', 15).defaultTo(null);
      table.string('fda', 50).defaultTo(null);
      table.string('tga', 15).defaultTo(null);
      table.boolean('paed_cancer_trial').defaultTo(null);
      table.text('include_reason');
      table.text('comment');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.unique(['screen', 'drug_id']);

      table.index('drug_id');
      table
        .foreign('drug_id')
        .references('drug_id')
        .inTable('zcc_drugs')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
