import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_biosample', (table) => {
    table.enum('biomarker', [
      'ctdna',
      'ctc',
      'csf',
      'cells',
      'normal',
    ]).after('biosample_source');
    table.string('parent_biomaterial').after('parent_biomaterial_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
