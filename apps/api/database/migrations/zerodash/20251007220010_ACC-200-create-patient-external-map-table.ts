import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('patient_external_map', (table) => {
    // Composite primary key
    table.string('public_subject_id').notNullable();
    table.string('accession_name').notNullable();
    table.primary(['public_subject_id', 'accession_name']);

    // Additional columns
    table.string('accession_type').notNullable();
    table.string('external_patient_id').notNullable();

    // Indexes for better query performance with shorter names
    table.index(['public_subject_id'], 'idx_patient_map_subject_id');
    table.index(['accession_name'], 'idx_patient_map_accession_name');
    table.index(['accession_name', 'external_patient_id'], 'idx_patient_map_accession_ext_id');

    // Table specifications
    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('patient_external_map');
}
