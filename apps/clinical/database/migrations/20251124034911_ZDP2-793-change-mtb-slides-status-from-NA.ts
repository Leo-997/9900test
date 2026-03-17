import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.update({ status: 'Ready to Start' })
    .from('zcc_clinical_versions')
    .where('pseudo_status', 'N/A')
    .andWhere('status', 'N/A');
}

export async function down(knex: Knex): Promise<void> {
}
