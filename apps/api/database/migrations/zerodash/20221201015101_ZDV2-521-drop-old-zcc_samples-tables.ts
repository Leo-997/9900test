import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('zcc_analysis_set_exp_xref')
    .then(() => {
      return knex.schema.dropTableIfExists('zcc_samples');
    })
    .then(() => {
      return knex.schema.dropTableIfExists('zcc_analysis_set');
    });
}


export async function down(knex: Knex): Promise<void> {
}

