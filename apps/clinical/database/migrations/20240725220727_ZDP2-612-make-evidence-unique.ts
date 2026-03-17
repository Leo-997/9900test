import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_evidence', (table) => {
    table.dropUnique(
      ['external_id', 'entity_type', 'entity_id'],
      'zcc_clinical_evidence_unique_links',
    );
  }).then(() => (
    knex.schema.alterTable('zcc_clinical_evidence', (table) => {
      table.unique(
        ['external_id', 'clinical_version_id', 'entity_type', 'entity_id'],
        {
          indexName: 'zcc_clinical_evidence_unique_link',
        },
      );
    })
  ));
}

export async function down(knex: Knex): Promise<void> {
}
