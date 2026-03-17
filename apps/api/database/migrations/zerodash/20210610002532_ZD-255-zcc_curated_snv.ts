import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    `zcc_curated_snv_anno`,
    function createSNVAnnoTbl(table) {
      table.integer('variant_id', 10).unsigned().notNullable().primary();

      table.specificType('cadd_scaled', 'double').defaultTo(null);

      table.boolean('pecan').defaultTo(null);

      table.enum('sjc_medal', ['Gold', 'Silver', 'Bronze']).defaultTo(null);

      table.enum('purple_hotspot', ['HOTSPOT', 'NEAR_HOTSPOT']).defaultTo(null);

      table.string('fathmm_pred', 300).defaultTo(null);

      table.string('provean_pred', 300).defaultTo(null);

      table.string('metalr_pred', 100).defaultTo(null);

      table.string('metasvm_pred', 100).defaultTo(null);

      table.string('clinvar_omim_id', 500).defaultTo(null);

      table.integer('clinvar_id', 11).defaultTo(null);

      table.string('clinvar_significance', 300).defaultTo(null);

      table.string('clinvar_confidence', 300).defaultTo(null);

      table.string('clinvar_revstat', 300).defaultTo(null);

      table.string('cosmic_id', 30).defaultTo(null);

      table.integer('cosmic_cosm_cnt', 11).defaultTo(null);

      table.integer('cosmic_cosn_cnt', 11).defaultTo(null);

      table.string('cosmic_pri_site', 500).defaultTo(null);

      table.string('cosmic_pri_histology', 500).defaultTo(null);

      table.boolean('dbsnp_is_common').defaultTo(null);

      table.string('dbsnp_rsid', 500).defaultTo(null);

      table.integer('gnomad_ac_exome', 11).defaultTo(null);

      table.integer('gnomad_an_exome', 11).defaultTo(null);

      table.specificType('gnomad_af_exome', 'double').defaultTo(null);

      table.integer('gnomad_ac_genome', 11).defaultTo(null);

      table.integer('gnomad_an_genome', 11).defaultTo(null);

      table.specificType('gnomad_af_genome', 'double').defaultTo(null);

      table.integer('gnomad_ac_exome_popmax', 11).defaultTo(null);

      table.integer('gnomad_an_exome_popmax', 11).defaultTo(null);

      table.specificType('gnomad_af_exome_popmax', 'double').defaultTo(null);

      table.integer('gnomad_ac_genome_popmax', 11).defaultTo(null);

      table.integer('gnomad_an_genome_popmax', 11).defaultTo(null);

      table.specificType('gnomad_af_genome_popmax', 'double').defaultTo(null);

      table.integer('gnomad_nhomalt', 11).defaultTo(null);

      table.integer('gnomad_nhomalt_popmax', 11).defaultTo(null);

      table.integer('gnomad_ac_noncancer', 11).defaultTo(null);

      table.integer('gnomad_an_noncancer', 11).defaultTo(null);

      table.specificType('gnomad_af_noncancer', 'double').defaultTo(null);

      table.integer('mgrb_ac', 11).defaultTo(null);

      table.integer('mgrb_an', 11).defaultTo(null);

      table.boolean('in_cancergenecensus').defaultTo(null);

      table
        .foreign('variant_id')
        .references('zcc_curated_snv.variant_id')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
