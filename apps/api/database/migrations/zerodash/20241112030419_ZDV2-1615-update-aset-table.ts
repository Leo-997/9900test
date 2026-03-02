import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.dropColumns(
      'precuration_validated',
      'precuration_validated_by',
      'precuration_validated_at',
      'comment_thread_id',
      'purity',
      'ploidy',
      'contamination',
      'contamination_score',
    );
  });
}

export async function down(): Promise<void> {
}
