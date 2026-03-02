import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_recommendations_entity_xref', (table) => {
    table.uuid('recommendation_id');
    table.uuid('clinical_version_id');
    table.string('entity_type', 50);
    table.string('entity_id');
    table.boolean('is_hidden');
    table.integer('order');

    table.primary([
      'recommendation_id',
      'clinical_version_id',
      'entity_type',
      'entity_id',
    ]);

    table.foreign('recommendation_id', 'zcc_clinical_recs_xref_rec_id_foreign')
      .references('id')
      .inTable('zcc_clinical_recommendations')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.foreign('clinical_version_id', 'zcc_clinical_recs_xref_version_id_foreign')
      .references('id')
      .inTable('zcc_clinical_versions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  })
    .then(() => (
      knex.insert(
        knex.select({
          recommendation_id: 'id',
          clinical_version_id: 'clinical_version_id',
          entity_type: knex.raw('"SLIDE"'),
          entity_id: 'slide_id',
          order: 'slide_order',
          is_hidden: 'is_hidden',
        })
          .from('zcc_clinical_recommendations')
          .whereNotNull('slide_id'),
      )
        .into('zcc_clinical_recommendations_entity_xref')
    ))
    .then(() => (
      knex.insert(
        knex.select({
          recommendation_id: 'id',
          clinical_version_id: 'clinical_version_id',
          entity_type: knex.raw('"SLIDE"'),
          entity_id: knex.raw('"DISCUSSION"'),
          order: 'slide_order',
          is_hidden: 'is_hidden',
        })
          .from('zcc_clinical_recommendations')
          .whereNull('slide_id')
          .andWhere('in_report', false)
          .andWhere('type', 'GROUP'),
      )
        .into('zcc_clinical_recommendations_entity_xref')
    ))
    .then(() => (
      knex.insert(
        knex.select({
          recommendation_id: 'id',
          clinical_version_id: 'clinical_version_id',
          entity_type: knex.raw('"REPORT"'),
          entity_id: knex.raw('"MTB_REPORT"'),
          order: knex.raw('NULL'),
          is_hidden: 'is_hidden',
        })
          .from('zcc_clinical_recommendations')
          .where('in_report', true),
      )
        .into('zcc_clinical_recommendations_entity_xref')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
        table.dropForeign('slide_id');
        table.dropColumns('in_report', 'slide_order', 'is_hidden', 'slide_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
