import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_cytobandcnv', table => {
    table.string('chr', 15).after('cytoband');
    table.enum('arm', ['p','q','centromere','telomere']).after('chr');
  })
}


export async function down(knex: Knex): Promise<void> {
}

