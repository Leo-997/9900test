import type { Knex } from 'knex';
import { v4 } from 'uuid';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_rna_classifier', (table) => {
    table.uuid('rna_classifier_id').primary();
    table.string('name').notNullable();
    table.string('version').notNullable();
    table.text('note');
    table.boolean('show_in_atlas')
      .defaultTo(false)
      .notNullable();
  })
    .then(async () => {
      const classifiers = await knex.distinct({
        classifier: 'classifier',
        version: 'version',
      })
        .from('zcc_curated_sample_somatic_rnaseq_classification');
      if (classifiers.length) {
        await knex.insert(classifiers.map((c) => ({
          rna_classifier_id: v4(),
          name: c.classifier,
          version: c.version.replace(/[vV]/, ''),
        })))
          .into('zcc_rna_classifier');
      }
    });
}

export async function down(knex: Knex): Promise<void> {
}
