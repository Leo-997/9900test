import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('datafiles', (table) => {
    // make changes to the datafiles table
    table.string('patient_id', 255);
    table.string('sample_id', 150);
    table.enum('ref_genome', [
      'hg19',
      'hg38',
      'GRCh37',
      'hs37d5',
      'GRCh38fullphix',
      'GRCh38lite',
      'GRCh37illumina'
    ]);
    table.enum('sample_type', [
      'tumour',
      'normal',
      'donor',
      'unknown'
    ]);
    table.string('platform', 45);
    table.string('public_patient_id', 25);
    table.string('public_sample_id', 25);
    table.integer('lane');
    table.string('flowcell_id', 45);
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  }).catch((err) => {}).then(async () => {
    // populate the metadata fields
    const files = await knex.select({
      fileId: 'file_id',
      patientId: 'patient_id',
      sampleId: 'sample_id',
      refGenome: 'refgenome',
      sampleType: 'sample_type',
      lane: 'lane',
      flowcellId: 'flowcell_id'
    })
    .from('metadata');
    
    for (let file of files) {
      await knex('datafiles').update({
        patient_id: file.patientId,
        sample_id: file.sampleId,
        ref_genome: file.refGenome,
        sample_type: file.sampleType,
        lane: file.lane,
        flowcell_id: file.flowcellId
      })
      .where({file_id: file.fileId});
    }
  })
  .then (() => {
    // populate the platform field
    ['dnanexus', 'ncimdss', 'netapp'].forEach(async (table_name) => {
      const files = await knex.select({
        file_id: 'file_id'
      })
      .from(table_name);

      for (let file of files) {
        await knex('datafiles').update({
          platform: table_name
        })
        .where({ file_id: file.file_id });
      }
    })
  })
  .then (async () => {
    // change the charset to UTF8
    await knex.raw('SET FOREIGN_KEY_CHECKS=0;');
    [
      'datafiles',
      'collections',
      'secondary_files',
      'dnanexus',
      'ncimdss',
      'netapp',
      'metadata'
    ].forEach(async (table_name) => {
      await knex.schema.raw(`ALTER TABLE ${table_name} CONVERT TO CHARACTER SET UTF8MB3;`);
    });
    await knex.raw('SET FOREIGN_KEY_CHECKS=1;');
  })
  .then(async () => {
    // create the new tables for zerodash
    [
      {
        table_name: 'zcc_zd_circos',
        types: ['circos', 'raw_circos']
      },
      {
        table_name: 'zcc_zd_qc',
        types: [
          'vaf_subclonal_dist', 
          'rig_profile',
          'cnv_proifle',
          'vaf_clonal_dist',
          'purple_minor_allele_ploidy',
          'purple_clonality_model',
          'purple_fitted_segment',
          'purple_kataegis_clusters',
          'purple_somatic_variant_ploidy',
          'purple_copy_number',
          'purple_purity_range'
        ]
      },
      {
        table_name: 'zcc_zd_mutsig',
        types: ['fit', 'matching', 'matrix']
      }
    ].forEach(async (table) => {
      const {table_name, types} = table;
      await knex.schema.createTable(table_name, (table) => {
        table.uuid('file_id').primary().notNullable();
        table.foreign('file_id')
          .references('file_id')
          .inTable('datafiles')
          .onDelete('RESTRICT')
          .onUpdate('CASCADE');
        table.enum('type', types).notNullable();

        table.engine('InnoDB');
        table.charset('utf8');
      });
    });
    await knex.schema.createTable('zcc_zd_linx', (table) => {
      table.uuid('file_id').primary().notNullable();
      table.foreign('file_id')
        .references('file_id')
        .inTable('datafiles')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
      table.enum('chr', [
        "1","2","3","4","5","6","7","8","9","10","11","12","13",
        "14","15","16","17","18","19","20","21","22","M","X","Y"
      ]);
      table.string('cluster_id', 45);
      table.string('genes');

      table.engine('InnoDB');
      table.charset('utf8');
    });
    await knex.schema.createTable('zcc_zd_rna_seq', (table) => {
      table.uuid('file_id').primary().notNullable();
      table.foreign('file_id')
        .references('file_id')
        .inTable('datafiles')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
      table.string('rnaseq_id', 150);
      table.string('gene', 45);

      table.engine('InnoDB');
      table.charset('utf8');
    });
  })
  .then(async () => {
    // drop the metadata table
    await knex.schema.dropTable('metadata');
  })
}


export async function down(knex: Knex): Promise<void> {
}

