import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.dropForeign(['comment_thread_id']);
  })
    .then(() => (
      knex.schema.alterTable('zcc_sample', (table) => {
        table.dropColumn('comment_thread_id');
      })
    ))
    .then(async () => {
      const tablesToDrop = [
        'zcc_annotation_summary',
        'zcc_annotation_summary_thread',
        'zcc_citation',
        'zcc_comment',
        'zcc_comment_thread',
        'zcc_drug_details',
        'zcc_drug_pathway_xref',
        'zcc_drug_ref_xref',
        'zcc_drugs',
        'zcc_sample_resources',
      ];

      // eslint-disable-next-line guard-for-in
      for (const table of tablesToDrop) {
        // need this to run in order, so using this syntax
        // eslint-disable-next-line no-await-in-loop
        await knex.schema.dropTableIfExists(table);
      }
    });
}

export async function down(knex: Knex): Promise<void> {
}
