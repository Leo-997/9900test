import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_sample_germline_cnv',
    function createCuratedSampleGermlineCnvTbl(table) {
      table.increments('variant_id');
      table.integer('gene_id', 11).unsigned().notNullable();
      table.string('matched_normal_id', 150).notNullable();

      table.specificType('avecopynumber', 'double').defaultTo(null);
      table.string('cn_type', 255).defaultTo(null);
      table
        .enum('platforms', ['W', 'R', 'P', 'WR', 'WP', 'RP', 'WPR'])
        .defaultTo(null);
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
        ['matched_normal_id', 'gene_id'],
        'uniq_matched_normal_id_gene_id',
      );

      table.index('cn_type');
      table.index('matched_normal_id', 'zcc_cur_germ_cnv_norm_id_idx');
      table.index('gene_id');

      table
        .foreign('gene_id')
        .references('zcc_genes.gene_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table
        .foreign('matched_normal_id', 'zcc_cur_germ_cnv_norm_id_fk')
        .references('zcc_sample.matched_normal_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
