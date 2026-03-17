import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_samples', (table) => {
    table.string('lm_subj_id', 10)
      .after('zcc_sample_id')
      .nullable()
      .defaultTo(null);
  });
}


export async function down(knex: Knex): Promise<void> {
}

