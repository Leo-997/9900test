import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_samples', (table) => {
    table.string('biosample_id', 150).notNullable().primary();
    table.string('patient_id', 255).notNullable();
    table.string('zcc_sample_id', 25).nullable();
    table.integer('manifest_id').unsigned().nullable();
    table.integer('platform_id').unsigned().nullable();
    table.enum('sample_type', ['wgs', 'rnaseq', 'panel', 'methylation', 'hts', 'pdx']).nullable();
    table.enum('biosample_status', ['normal', 'tumour', 'donor']).nullable();
    table.string('biomaterial_id', 25).nullable();
    table.integer('ancestor_biomaterial').nullable();
    table.string('biomaterial_name', 50).nullable();
    table.integer('parent_biomaterial_id').nullable();
    table.enum('specimen', ['TT', 'BMA', 'BMT', 'CSF', 'PB', 'SK', 'PF', 'CL', 'PDX', 'HTS', 'CC', 'DNA,RNA', 'PBSC', 'OTHER']).nullable();
    table.enum('specimen_state', ['fresh', 'snap_frozen', 'cyropreserved', 'ffpe_block', 'ffpe_slides', 'other']).nullable();
    table.string('age_at_sample', 45).nullable();
    table.date('collection_date').nullable();
    table.date('processing_date').nullable();
    table.string('sample_origin_type', 300).nullable();

    table.unique(['zcc_sample_id']);
    table.index(['patient_id'], 'zcc_samples_patient_idx');
    table.index(['manifest_id'], 'zcc_samples_manifest_idx');
    table.index(['platform_id'], 'zcc_samples_platforms');
    table.foreign('patient_id').references('patient_id').inTable('zcc_patient');
    table.foreign('manifest_id').references('manifest_id').inTable('zcc_manifest');
    table.foreign('platform_id').references('platform_id').inTable('zcc_platforms');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

