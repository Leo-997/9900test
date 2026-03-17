import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curated_reportable_variants', (table) => {
    table.string('sample_id', 150);
    table.string('variant_type', 50);
    table.string('variant_id');
    table.string('report_type', 50);

    table.primary(
      ['sample_id', 'variant_type', 'variant_id', 'report_type'],
      'zcc_curated_reportable_variants_primary',
    );

    table.index(['variant_type']);
    table.index(['variant_id']);
    table.index(['report_type']);

    table
      .foreign('sample_id')
      .references('sample_id')
      .inTable('zcc_sample')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
export async function down(knex: Knex): Promise<void> {
}
