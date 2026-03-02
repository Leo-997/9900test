import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curated_sample_germline_sv',
    (table) => {
      table.uuid('internal_id').notNullable().primary();
      table.integer('variant_id').unsigned().notNullable();
      table.string('matched_normal_id', 150).notNullable();
      table.uuid('parent_id').defaultTo(null);

      table.integer('start_gene_exons', 11).defaultTo(null);
      table.integer('end_gene_exons', 11).defaultTo(null);
      table.string('start_fusion').notNullable();
      table.string('end_fusion').notNullable();
      table.string('chr_bkpt1', 15).notNullable();
      table.integer('pos_bkpt1', 11).unsigned().notNullable();
      table.string('chr_bkpt2', 15).notNullable();
      table.integer('pos_bkpt2', 11).unsigned().notNullable();

      table.double('start_af').defaultTo(null);
      table.double('end_af').defaultTo(null);

      table.integer('rna_start_gene_exons', 11).defaultTo(null);
      table.integer('rna_end_gene_exons', 11).defaultTo(null);
      table.string('rna_start_fusion').defaultTo(null);
      table.string('rna_end_fusion').defaultTo(null);
      table.string('rna_chr_bkpt1', 15).defaultTo(null);
      table.integer('rna_pos_bkpt1', 11).unsigned().defaultTo(null);
      table.string('rna_chr_bkpt2', 15).defaultTo(null);
      table.integer('rna_pos_bkpt2', 11).unsigned().defaultTo(null);

      table.double('ploidy').defaultTo(null);

      table.string('sv_type', 10).defaultTo(null);
      table.string('inframe', 255).defaultTo(null);
      table
        .enum('platforms', ['W', 'R', 'P', 'WR', 'WP', 'RP', 'WPR'])
        .defaultTo(null);
      table.enum('wgsconf', ['High', 'Med', 'Low']).defaultTo(null);
      table.enum('rnaconf', ['High', 'Med', 'Low']).defaultTo(null);
      table.enum('disrupted', ['No', 'Yes', 'Start', 'End', 'Both']).defaultTo(null);
      table.enum('mark_disrupted', ['No', 'Yes', 'Start', 'End', 'Both']).defaultTo(null);

      table.string('classification', 255).defaultTo(null);
      table.boolean('reportable').defaultTo(null);
      table.boolean('targetable').defaultTo(null);
      table.integer('somaticscore', 5).defaultTo(null);
      table.string('pathclass', 50).defaultTo(null);

      table.integer('pathscore', 5).defaultTo(null);
      table.double('helium_score').defaultTo(null);
      table.string('helium_comment', 500).defaultTo(null);
      table.timestamp('helium_updated').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by', 255).defaultTo(null);
      table.string('updated_by', 255).defaultTo(null);

      table.unique(
        [
          'variant_id',
          'matched_normal_id',
          'start_fusion',
          'end_fusion',
          'chr_bkpt1',
          'pos_bkpt1',
          'chr_bkpt2',
          'pos_bkpt2',
        ],
        'uniq_cur_sample_germline_sv_idx',
      );

      table.index('variant_id');
      table.index('matched_normal_id');
      table.index('parent_id');

      table
        .foreign('variant_id')
        .references('zcc_curated_somatic_sv.variant_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table
        .foreign('matched_normal_id')
        .references('zcc_sample.matched_normal_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table
        .foreign('parent_id')
        .references('internal_id')
        .inTable('zcc_curated_sample_germline_sv')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');

      table.engine('InnoDB');
      table.charset('utf8');
    });
}

export async function down(knex: Knex): Promise<void> {
}
