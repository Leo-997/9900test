import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_annotation_comment_thread', (table) => {
    table.increments('comment_thread_id');
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

    table.string('created_by', 255);
    table.timestamp('created_at');

    table.index(['variant_id', 'variant_type']);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
