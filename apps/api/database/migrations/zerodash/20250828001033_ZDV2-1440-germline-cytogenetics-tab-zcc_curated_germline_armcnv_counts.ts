import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curated_germline_armcnv_counts', (table) => {
    // PK columns (implicitly NOT NULL because of composite primary key below)
    table.string('chr', 15);
    table.enu('arm', ['p', 'q', 'centromere', 'telomere']);
    table.string('cn_type').defaultTo('NEU');

    // Other columns
    table.integer('sample_count');
    table.integer('cancer_types');
    table.integer('reported_count').unsigned();
    table.integer('targetable_count').unsigned();

    // Keys & indexes
    table.primary(['chr', 'arm', 'cn_type']);
    table.index(['chr', 'arm'], 'zcc_curated_germline_armcnv_counts_chr_arm_index');

    // table options
    table.engine('InnoDB');
    table.charset('utf8mb3');
  });
}

export async function down(knex: Knex): Promise<void> {
}
