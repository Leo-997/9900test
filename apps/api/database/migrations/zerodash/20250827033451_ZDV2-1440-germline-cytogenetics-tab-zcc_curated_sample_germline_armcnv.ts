import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curated_sample_germline_armcnv', (table) => {
    // PK columns (implicitly NOT NULL because of composite primary key below)
    table.string('biosample_id', 150);
    table.string('chr', 15);
    table.enu('arm', ['p', 'q', 'centromere', 'telomere']);
    // Other columns
    table.string('cn_type').notNullable().defaultTo('NEU');
    table.string('cytoband', 500).notNullable();
    table.double('avecopynumber');
    table.double('aveminminorallelecn');
    table.string('classification');
    table.boolean('reportable');
    table.boolean('targetable');
    table.boolean('research_candidate');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.string('updated_by');
    // Keys & indexes
    table.primary(['biosample_id', 'chr', 'arm']);
    table.index(['chr', 'arm'], 'zcc_curated_sample_germline_armcnv_chr_arm_index');
    table.index(['chr', 'arm', 'cn_type'], 'zcc_curated_sample_germline_armcnv_chr_arm_cn_type_index');
    table
      .foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('cascade')
      .onUpdate('cascade');
    // Table options
    table.engine('InnoDB');
    table.charset('utf8mb3');
  });
}

export async function down(knex: Knex): Promise<void> {
}
