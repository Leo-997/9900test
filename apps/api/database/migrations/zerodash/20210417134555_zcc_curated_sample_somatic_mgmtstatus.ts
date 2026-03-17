import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_sample_somatic_mgmtstatus',
    function createSomaticMgmtStatusTbl(table) {
      table.string('sample_id', 150).primary();

      table.enum('meth_status', ['unmethylated', 'methylated']).defaultTo(null);
      table.specificType('estimated', 'double').defaultTo(null);
      table.specificType('ci_lower', 'double').defaultTo(null);
      table.specificType('ci_upper', 'double').defaultTo(null);
      table.specificType('cutoff', 'double').defaultTo(null);

      table.string('reportable').defaultTo(null);
      table.boolean('targetable').defaultTo(null);
      table.string('evidence', 4000).defaultTo(null);
      table.text('curator_summary').defaultTo(null);
      table.text('comments').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table
        .foreign('sample_id')
        .references('zcc_sample.sample_id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
