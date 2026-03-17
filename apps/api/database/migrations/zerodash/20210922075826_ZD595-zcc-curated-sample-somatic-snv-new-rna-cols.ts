import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('zcc_curated_sample_somatic_snv', (table) => {
        table.specificType('rna_vaf_no', 'double').after('rna_vaf').defaultTo(null);
        table.integer('rna_altad').after('rna_vaf_no').defaultTo(null);
        table.integer('rna_depth').after('rna_altad').defaultTo(null);
        table.string('rna_impact',150).after('rna_depth').defaultTo(null);
      });
}

export async function down(knex: Knex): Promise<void> {
}

