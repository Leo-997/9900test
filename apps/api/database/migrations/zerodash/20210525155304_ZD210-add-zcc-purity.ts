import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_purity',
    function createPlatformsTbl(table) {
      table.increments('purity_id');
      table.string('sample_id', 150).notNullable().unique();

      table.specificType('purity', 'double').defaultTo(null);
      table.specificType('min_purity', 'double').defaultTo(null);
      table.specificType('max_purity', 'double').defaultTo(null);
      table.specificType('ploidy', 'double').defaultTo(null);
      table.specificType('min_ploidy', 'double').defaultTo(null);
      table.specificType('max_ploidy', 'double').defaultTo(null);

      table.string('ms_status', 10).defaultTo(null);
      table.boolean('wg_duplication').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.index('sample_id');
      table.foreign('sample_id').references('zcc_sample.sample_id');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
