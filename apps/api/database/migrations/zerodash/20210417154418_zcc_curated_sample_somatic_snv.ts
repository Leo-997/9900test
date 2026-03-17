import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_sample_somatic_snv',
    function createCuratedSampleSomaticSnvTbl(table) {
      table.increments('internal_id');
      table.string('sample_id', 150).notNullable();
      table.integer('variant_id', 11).unsigned().notNullable();

      table.integer('depth', 11).unsigned().defaultTo(null);
      table.integer('altad', 11).unsigned().defaultTo(null);

      table.string('genotype', 4000).defaultTo(null);
      table.specificType('copynumber', 'double').defaultTo(null);
      table.specificType('adjustedcopynumber', 'double').defaultTo(null);
      table.specificType('adjustedvaf', 'double').defaultTo(null);
      table.boolean('biallelic').defaultTo(null);
      table.specificType('subclonalLikelihood', 'double').defaultTo(null);
      table
        .enum('platforms', ['W', 'R', 'P', 'WR', 'WP', 'RP', 'WPR'])
        .defaultTo(null);

      table.specificType('rna_tpm', 'double').defaultTo(null);
      table.string('rna_vaf', 150).defaultTo(null);
      table.specificType('panel_vaf', 'double').defaultTo(null);

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
          'Unclassified',
          'Failed PathOS filters',
          'C3.8: VOUS',
          'GUS',
        ])
        .defaultTo(null);
      table
        .enum('sjc_medal', ['gold', 'silver', 'bronze', 'none'])
        .defaultTo(null);
      table.string('evidence', 4000).defaultTo(null);
      table.text('curator_summary').defaultTo(null);
      table.text('comments').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.unique(['sample_id', 'variant_id']);
      table.index('sample_id');
      table.index('variant_id');

      table
        .foreign('variant_id')
        .references('zcc_curated_somatic_snv.variant_id')
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
