import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_evidences', (table) => {
    table.uuid('evidence_id').alter();
    table.uuid('external_id').after('evidence_id');
    table.string('sample_id', 150).after('external_id').alter();
    table.string('variant_type').after('sample_id').nullable().alter();
    table.string('variant_id', 150).after('variant_type').nullable().alter();
    table.timestamp('updated_at').nullable().alter();
    table.dropForeign(['citation_id']);
    table.dropForeign(['resource_id']);
    table.dropColumns('resource_id', 'citation_id', 'is_deleted');
  });
}

export async function down(knex: Knex): Promise<void> {}
