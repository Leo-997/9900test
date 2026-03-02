import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_evidences', async (table) => {
    table.string('entity_type').after('variant_type');
    table.string('entity_id').after('variant_id');
  })
    .then(() => (
      knex
        .update({
          entity_type: knex.raw('variant_type'),
          entity_id: knex.raw('variant_id'),
        })
        .from('zcc_evidences')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_evidences', (table) => {
        table.dropColumn('variant_type');
        table.dropColumn('variant_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
