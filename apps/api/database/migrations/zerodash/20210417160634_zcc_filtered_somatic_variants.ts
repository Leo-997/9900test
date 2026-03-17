import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_filtered_somatic_variants',
    function createFilteredSomaticVariantsTbl(table) {
      table.increments('internal_id');
      table.string('sample_id', 150).notNullable();

      table.integer('qs15_ct', 11).defaultTo(null);
      table.integer('qs10_ct', 11).defaultTo(null);
      table.integer('no_loh_ct', 11).defaultTo(null);
      table.integer('no_mgrb_ct', 11).defaultTo(null);
      table.integer('no_low_conf_ct', 11).defaultTo(null);
      table.integer('no_vaf_qs1pt3_ct', 11).defaultTo(null);
      table.integer('no_naf0_taflessthan3xnaf_ct', 11).defaultTo(null);
      table.integer('rescue_hotspot_ct', 11).defaultTo(null);
      table.integer('final_pass', 11).defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.index('sample_id');
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
