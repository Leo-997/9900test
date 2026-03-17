import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('biosample_external_map', (table) => {
    // Composite primary key
    table.string('biosample_uuid').notNullable();
    table.string('accession_name').notNullable();
    table.primary(['biosample_uuid', 'accession_name']);

    // Additional columns
    table.string('public_subject_id').notNullable();
    table.string('accession_type').notNullable();
    table.string('external_biosample_id').notNullable();

    // Indexes for better query performance with shorter names
    table.index(['biosample_uuid'], 'idx_biosample_map_uuid');
    table.index(['public_subject_id'], 'idx_biosample_map_subject_id');
    table.index(['accession_name'], 'idx_biosample_map_accession_name');
    table.index(['accession_name', 'external_biosample_id'], 'idx_biosample_map_accession_ext_id');

    // Table specifications
    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('biosample_external_map');
}
