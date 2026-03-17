import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_clinical_diagnosis_recommendations', (table) => {
    table.string('recommended_final_diagnosis', 500).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
