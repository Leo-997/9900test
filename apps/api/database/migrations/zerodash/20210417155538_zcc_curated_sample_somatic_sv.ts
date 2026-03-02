import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_sample_somatic_sv',
    function createSampleSomaticSvTbl(table) {
      table.increments('internal_id');
      table.integer('variant_id', 11).unsigned().notNullable();
      table.string('sample_id', 150).notNullable();

      table.integer('start_gene_exons', 11).defaultTo(null);
      table.integer('end_gene_exons', 11).defaultTo(null);
      table.string('start_fusion', 500).notNullable();
      table.string('end_fusion', 500).notNullable();
      table.string('chr_bkpt1', 15).notNullable();
      table.integer('pos_bkpt1', 11).unsigned().notNullable();
      table.string('chr_bkpt2', 15).notNullable();
      table.integer('pos_bkpt2', 11).unsigned().notNullable();

      table.specificType('start_af', 'double').defaultTo(null);
      table.specificType('end_af', 'double').defaultTo(null);
      table.specificType('ploidy', 'double').defaultTo(null);

      table.string('sv_type', 10).defaultTo(null);
      table.boolean('inframe').defaultTo(null);
      table
        .enum('platforms', ['W', 'R', 'P', 'WR', 'WP', 'RP', 'WPR'])
        .defaultTo(null);
      table.enum('wgsconf', ['High', 'Med', 'Low']).defaultTo(null);
      table.enum('rnaconf', ['High', 'Med', 'Low']).defaultTo(null);

      table.string('reportable').defaultTo(null);
      table.boolean('targetable').defaultTo(null);
      table.integer('pathscore', 5).defaultTo(null);
      table.string('pathclass', 50).defaultTo(null);
      table.string('evidence', 4000).defaultTo(null);
      table.text('curator_summary').defaultTo(null);
      table.text('comments').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.unique(
        [
          'variant_id',
          'sample_id',
          knex.raw('`start_fusion`(250)'),
          knex.raw('`end_fusion`(250)'),
          'chr_bkpt1',
          'pos_bkpt1',
          'chr_bkpt2',
          'pos_bkpt2',
        ],
        'uniq_cur_sample_somatic_sv_idx',
      );

      table.index('variant_id');
      table.index('sample_id');

      table
        .foreign('variant_id')
        .references('zcc_curated_somatic_sv.variant_id')
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
