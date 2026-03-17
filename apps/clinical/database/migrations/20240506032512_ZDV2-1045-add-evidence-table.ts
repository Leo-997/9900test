import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_evidence', (table) => {
    table.uuid('id').primary();
    table.uuid('external_id').notNullable();
    table.uuid('clinical_version_id');
    table.string('entity_type', 50).notNullable();
    table.string('entity_id').notNullable();
    table.string('created_by').notNullable();
    table.timestamp('created_at').notNullable();

    table.index('entity_type');
    table.index('entity_id');

    table.unique(
      ['external_id', 'entity_type', 'entity_id'],
      {
        indexName: 'zcc_clinical_evidence_unique_links',
      },
    );

    table.foreign('clinical_version_id')
      .references('id')
      .inTable('zcc_clinical_versions')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('zcc_clinical_evidence');
}
