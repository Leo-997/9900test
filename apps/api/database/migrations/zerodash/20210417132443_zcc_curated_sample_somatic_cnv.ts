import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_sample_somatic_cnv',
    function createSampleSomaticCnvTbl(table) {
      table.increments('variant_id');
      table.string('sample_id', 150).notNullable();
      table.integer('gene_id', 11).unsigned().notNullable();

      table.string('chr', 15).defaultTo(null);

      table.specificType('avecopynumber', 'double').defaultTo(null);
      table.specificType('minCN', 'double').defaultTo(null);
      table.specificType('maxCN', 'double').defaultTo(null);
      table.specificType('minMinorAlleleCN', 'double').defaultTo(null);
      table.integer('bkpt1', 11).unsigned().defaultTo(null);
      table.integer('bkpt2', 11).unsigned().defaultTo(null);

      table
        .enum('platforms', ['W', 'R', 'P', 'WR', 'WP', 'RP', 'WPR'])
        .defaultTo(null);
      table.specificType('rna_tpm', 'double').defaultTo(null);
      table.specificType('rna_median_tpm', 'double').defaultTo(null);
      table.specificType('rna_zscore', 'double').defaultTo(null);
      table.string('reportable').defaultTo(null);
      table.boolean('targetable').defaultTo(null);
      table.integer('pathscore', 5).defaultTo(null);
      table
        .enum('pathclass', [
          'C5: Pathogenic',
          'C4: Likely pathogenic',
          'C3: Unknown pathogenicity',
          'C2: Unlikely pathogenic',
          'C1: Not pathogenic',
          'C3.8: VOUS',
          'GUS',
          'Unclassified',
          'Failed PathOS filters',
        ])
        .defaultTo(null);
      table.string('evidence', 4000).defaultTo(null);
      table.text('curator_summary').defaultTo(null);
      table.text('comments').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.unique(['sample_id', 'gene_id']);

      table.index('sample_id');
      table.index('gene_id');

      table
        .foreign('gene_id')
        .references('gene_id')
        .inTable('zcc_genes')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table
        .foreign('sample_id')
        .references('zcc_sample.sample_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
