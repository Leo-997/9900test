import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.string('cohort', 200).after('final_diagnosis');
    table.string('histological_diagnosis', 500).after('cohort');
  });
}

export async function down(knex: Knex): Promise<void> {
}
