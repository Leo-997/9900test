import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.string('mtb_chair_id').after('sample_id').defaultTo(null);
  })
    .then(async () => {
      const resp = await knex
        .select({
          chair: 'meeting.chair',
          version: 'xref.clinical_version_id',
        })
        .from({ meeting: 'zcc_clinical_meetings' })
        .innerJoin({ xref: 'zcc_clinical_meeting_version_xref' }, 'meeting.id', 'xref.meeting_id')
        .where('meeting.type', 'MTB')
        .andWhereNot('meeting.chair', null);

      await Promise.all(resp.map(({ chair, version }) => (
        knex
          .update({
            mtb_chair_id: chair,
          })
          .from({ version: 'zcc_clinical_versions' })
          .where('version.id', version)
      )));
    })
    .then(() => knex.schema.alterTable('zcc_clinical_meetings', (table) => {
      table.dropColumn('chair');
    }));
}

export async function down(knex: Knex): Promise<void> {
}
