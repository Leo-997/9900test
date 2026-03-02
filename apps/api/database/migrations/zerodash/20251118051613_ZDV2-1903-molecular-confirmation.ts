import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('zcc_molecular_confirmation', (table) => {
    table.uuid('id').primary();
    table.uuid('analysis_set_id').unique().notNullable();
    table.string('change_or_refinement', 50).notNullable().defaultTo('No change required');
    table.text('change_or_refinement_notes');
    table.string('pathologist_agreement', 50).notNullable().defaultTo('N/A');
    table.text('pathologist_communication_method');
    table.text('pathologist_agreement_notes');
    table.boolean('final_diagnosis_updated').notNullable().defaultTo(false);
    table.string('diagnosis_subtype', 50);
    table.string('zero2_confirmed_subtype', 50);
    table.foreign('analysis_set_id')
      .references('analysis_set_id')
      .inTable('zcc_analysis_set')
      .onDelete('cascade')
      .onUpdate('cascade');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
