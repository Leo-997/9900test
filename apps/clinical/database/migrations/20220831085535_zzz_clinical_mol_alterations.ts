import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_mol_alterations', (table) => {
    table.string('id').primary().notNullable();
    table.string('mutation_id').notNullable();
    table.string('mutation_type').notNullable();
    table.string('gene').nullable();
    table.string('gene_id').nullable();
    table.string('pathway').nullable();
    table.string('pathway_id').nullable();
    table.string('alteration').nullable();
    table.string('curation_reportable').nullable();
    table.boolean('curation_targetable').nullable();
    table.string('clinical_reportable').nullable();
    table.boolean('clinical_targetable').nullable();
    table.integer('frequency').nullable();
    table.boolean('high_relapse_risk').nullable();
    table.string('sample_id').notNullable();
    table.string('patient_id').notNullable();
    table.string('clinical_version_id').notNullable();
    table.text('clinical_notes').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('zcc_clinical_mol_alterations');
}
