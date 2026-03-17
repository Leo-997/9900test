import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_sv', table => {
    table.integer('rna_start_gene_exons', 11).nullable().defaultTo(null).after('end_af');
    table.integer('rna_end_gene_exons', 11).nullable().defaultTo(null).after('rna_start_gene_exons');
    table.string('rna_start_fusion', 500).nullable().defaultTo(null).after('rna_end_gene_exons');
    table.string('rna_end_fusion', 500).nullable().defaultTo(null).after('rna_start_fusion');
    table.string('rna_chr_bkpt1', 15).nullable().defaultTo(null).after('rna_end_fusion');
    table.integer('rna_pos_bkpt1', 11).unsigned().nullable().defaultTo(null).after('rna_chr_bkpt1');
    table.string('rna_chr_bkpt2', 15).nullable().defaultTo(null).after('rna_pos_bkpt1');
    table.integer('rna_pos_bkpt2', 11).unsigned().nullable().defaultTo(null).after('rna_chr_bkpt2');
  }).then(async () => {
    await knex('zcc_curated_sample_somatic_sv').update({
      rna_start_gene_exons: knex.raw('start_gene_exons'),
      rna_end_gene_exons: knex.raw('end_gene_exons'),
      rna_start_fusion: knex.raw('start_fusion'),
      rna_end_fusion: knex.raw('end_fusion'),
      rna_chr_bkpt1: knex.raw('chr_bkpt1'),
      rna_pos_bkpt1: knex.raw('pos_bkpt1'),
      rna_chr_bkpt2: knex.raw('chr_bkpt2'),
      rna_pos_bkpt2: knex.raw('pos_bkpt2'),
    })
    .where('platforms', 'R');
  });
}


export async function down(knex: Knex): Promise<void> {
}