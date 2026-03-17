import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_evidences', (table) => {
    table.string('evidence_id').primary();
    table
      .enum('variant_type', [
        'SNV',
        'CNV',
        'RNASeq',
        'Cytogenetics',
        'SV',
        'GermCNV',
        'GermSNV',
        'Methylation',
      ])
      .notNullable();
    table.string('variant_id').notNullable();
    table.integer('resource_id', 10).unsigned().notNullable();

    table.index('resource_id');
    table
      .foreign('resource_id')
      .references('zcc_sample_resources.resource_id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.string('sample_id', 150);
    table.index('sample_id');
    table
      .foreign('sample_id')
      .references('zcc_sample.sample_id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
