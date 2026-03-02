import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_somatic_cytobandcnv',
    (table) => {
      table.string('cytoband', 800).alter();
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
