import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('zcc_approvals');
  await knex.schema.dropTableIfExists('zcc_client_applications');
  await knex.schema.dropTableIfExists('zcc_notifications');
  await knex.schema.dropTableIfExists('zcc_references');
  await knex.schema.dropTableIfExists('zcc_sample_curation_summary_notes');
  await knex.schema.dropTableIfExists('zcc_sample_curation_workflow');
  await knex.schema.dropTableIfExists('zcc_curation_meeting_attendees');
}

export async function down(knex: Knex): Promise<void> {
}
