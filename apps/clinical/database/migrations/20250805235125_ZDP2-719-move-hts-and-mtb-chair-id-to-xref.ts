import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_clinical_meeting_version_xref', (table) => {
    table.string('chair_id').after('type').nullable();
  });

  await knex
    .update({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'xref.chair_id': knex.raw('v.mtb_chair_id'),
    })
    .from({ xref: 'zcc_clinical_meeting_version_xref' })
    .innerJoin({ v: 'zcc_clinical_versions' }, 'v.id', 'xref.clinical_version_id')
    .where('xref.type', 'MTB');

  await knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.dropColumn('mtb_chair_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
