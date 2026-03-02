import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_analysis_set', (table) => {
    table.uuid('analysis_set_id').notNullable().primary();
    table.string('patient_id', 255).notNullable();
    table.string('event_type', 5).nullable();
    table.string('study', 50).nullable();
    table.string('cancer_category', 50).nullable();
    table.string('cancer_type', 50).nullable();
    table.string('cancer_subtype', 500).nullable();
    table.string('disease', 250).nullable();
    table.string('diagnosis', 500).nullable();
    table.string('final_diagnosis', 500).nullable();
    table.string('zero2_category', 50).nullable();
    table.string('zero2_subcategory1', 500).nullable();
    table.string('zero2_subcategory2', 500).nullable();
    table.string('zero2_final_diagnosis', 500).nullable();
    table.string('who_grade', 5).nullable();
    table.string('histology', 200).nullable();
    table.boolean('molecular_confirmation').nullable();
    table.string('pri_site', 50).nullable();
    table.string('sample_site', 50).nullable();
    table.string('sample_met_site', 50).nullable();
    table.string('ncit_term', 100).nullable();
    table.string('ncit_code', 20).nullable();
    table.string('curation_status', 50).nullable();
    table.string('secondary_curation_status', 50).nullable();
    table.integer('som_missense_snvs').nullable();
    table.boolean('expedite').notNullable().defaultTo(false);
    table.double('purity').nullable();
    table.double('ploidy').nullable();
    table.integer('final_pass').nullable();
    table.string('msi_status', 50).nullable();
    table.double('contamination').nullable();
    table.double('contamination_score').nullable();
    table.double('mut_burden_mb').nullable();
    table.boolean('targetable').nullable();
    table.double('loh_proportion').nullable();
    table.string('primary_curator_id', 255).nullable();
    table.string('secondary_curator_id', 255).nullable();
    table.string('comment_thread_id', 255).nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by', 255).nullable();
    table.string('updated_by', 255).nullable();
    table.boolean('precuration_validated').notNullable().defaultTo(false);
    table.string('precuration_validated_by', 255).nullable();
    table.timestamp('precuration_validated_at').nullable();

    table.unique(['analysis_set_id']);
    table.index(['patient_id'], 'zcc_analysis_set_patient_idx');
    table.foreign('patient_id').references('patient_id').inTable('zcc_patient');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

