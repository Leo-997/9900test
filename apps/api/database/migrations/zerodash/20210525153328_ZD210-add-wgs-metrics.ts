import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('zcc_platforms', function createPlatformsTbl(table) {
      table.increments('platform_id');
      table.string('platform').notNullable().unique();
      table.enum('platform_type', [
        'wgs',
        'rnaseq',
        'panel',
        'methylation',
        'hts',
        'xeno',
      ]);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.engine('InnoDB');
      table.charset('utf8');
    })
    .createTable(`zcc_seq_metrics`, function createWgsMetrics(table) {
      table.string('sample_id', 150).notNullable();
      table.integer('platform_id', 10).unsigned().notNullable();
      table.enum('sample_type', ['normal', 'tumour', 'donor']).notNullable();

      table.integer('biomaterial_id', 11).defaultTo(null);

      table.specificType('mean_coverage', 'double').defaultTo(null);
      table.specificType('x20', 'double').defaultTo(null);
      table.specificType('x30', 'double').defaultTo(null);
      table.specificType('x50', 'double').defaultTo(null);

      table.integer('uniq_mapped_reads', 11).defaultTo(null);
      table.specificType('uniq_mapped_reads_pct', 'double').defaultTo(null);

      table.specificType('rin', 'double').defaultTo(null);

      table.enum('amber_qc', ['PASS', 'WARN', 'FAIL']).defaultTo(null);
      table.specificType('amber_tumor_baf', 'double').defaultTo(null);
      table.specificType('amber_contamination_pct', 'double').defaultTo(null);

      table.string('qc_status');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.primary(['sample_id', 'platform_id', 'sample_type']);

      table.index('sample_id');
      table.foreign('sample_id').references('zcc_sample.sample_id');

      table.engine('InnoDB');
      table.charset('utf8');
    });
}

export async function down(knex: Knex): Promise<void> {}
