import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_sample', function createSampleTbl(table) {
    table.string('sample_id', 150).primary();

    table.string('patient_id').notNullable();
    table.string('zcc_sample_id', 25).defaultTo(null).unique();
    table.integer('manifest_id').unsigned().defaultTo(null);
    table.string('rnaseq_id', 150).defaultTo(null);

    // What do these link to
    table.string('matched_normal_id', 150).defaultTo(null);
    table.string('panel_id', 50).defaultTo(null);
    table.string('panel_normal_id', 50).defaultTo(null);
    table.string('meth_id', 100).defaultTo(null);
    table.string('hts_id', 100).defaultTo(null);
    table.string('lm_subj_id', 50).defaultTo(null);

    table.string('biomaterial', 50).defaultTo(null);
    table.string('study', 50).defaultTo(null);
    table.integer('age_at_sample', 5).unsigned().defaultTo(null);
    table.string('cancer_category', 50).defaultTo(null);
    table.string('cancer_type', 50).defaultTo(null);
    table.string('cancer_subtype', 500).defaultTo(null);
    table.string('disease', 250).defaultTo(null);
    table.string('diagnosis', 500).defaultTo(null);
    table.string('final_diagnosis', 500).defaultTo(null);
    table.string('event_type', 5).defaultTo(null);
    table
      .enum('tissue', ['TT', 'BMA', 'BMT', 'CSF', 'PB', 'SK', 'PF'])
      .defaultTo(null);
    table.specificType('purity', 'double').defaultTo(null);
    table.specificType('ploidy', 'double').defaultTo(null);
    table.enum('msi_status', ['MSS', 'MSI', 'UNKNOWN']).defaultTo(null);
    table.enum('amber_qc', ['PASS', 'WARN', 'FAIL']).defaultTo(null);
    table.specificType('amber_tumor_baf', 'double').defaultTo(null);
    table.specificType('contamination', 'double').defaultTo(null);
    table.specificType('contamination_score', 'double').defaultTo(null);
    table.integer('rna_uniq_mapped_reads', 11).defaultTo(null);
    table.specificType('rna_uniq_mapped_reads_pct', 'double').defaultTo(null);
    table.specificType('rna_rin', 'double').defaultTo(null);
    table.specificType('mut_burden_mb', 'double').defaultTo(null);
    table.specificType('loh_proportion', 'double').defaultTo(null);
    table.text('comments').defaultTo(null);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by');
    table.string('updated_by');

    table.index('patient_id');
    table.index('manifest_id');
    table.index('rnaseq_id');
    table.index('matched_normal_id');

    table
      .foreign('patient_id')
      .references('zcc_patient.patient_id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table
      .foreign('manifest_id')
      .references('zcc_manifest.manifest_id')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
