import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex('zcc_hts_drugstats')
    .update({
      recommendation: null,
    })
    .where('recommendation', '')
    .then(() =>
      knex.schema.alterTable('zcc_hts_drugstats', (tbl) => {
        tbl.boolean('recommendation').alter();
      }),
    );
}

export async function down(knex: Knex): Promise<void> {}
