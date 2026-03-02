import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curated_sample_germline_cytobandcnv', (table) => {
    // PK columns (implicitly NOT NULL because of composite primary key below)
    table.string('biosample_id', 150);
    table.string('cytoband', 800);

    // Other columns
    table.string('chr', 15);
    table.enu('arm', ['p', 'q', 'centromere', 'telomere']);
    table.double('avecopynumber');
    table.double('custom_cn');
    table.string('cn_type', 25);
    table.string('classification');
    table.boolean('reportable');
    table.boolean('targetable');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.string('updated_by');

    // PK & FK
    table.primary(['biosample_id', 'cytoband']);
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
