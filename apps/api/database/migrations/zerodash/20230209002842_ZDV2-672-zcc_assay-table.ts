import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('zcc_assay')
    .then(() => {
      return knex.schema.createTable('zcc_assay', (table) => {
        table.string('assay_id', 36).notNullable();
        table.string('assay_name').notNullable();
        table.string('extraction_prot').nullable().defaultTo(null);
        table.string('library_prep').nullable().defaultTo(null);

        table.primary(['assay_id']);

        table.engine('InnoDB');
        table.charset('utf8');
      });
    })
    .then(() => {
      return knex.schema.alterTable('zcc_biosample', (table) => {
        table
          .string('assay_id', 36)
          .nullable()
          .defaultTo(null)
          .after('platform_id');

        table.index('assay_id', 'zcc_biosamples_assay_idx');

        table
          .foreign('assay_id', 'zcc_biosamples_assay')
          .references('assay_id')
          .inTable('zcc_assay')
          .onDelete('CASCADE')
          .onUpdate('CASCADE');
      });
    });
}

export async function down(knex: Knex): Promise<void> {}
