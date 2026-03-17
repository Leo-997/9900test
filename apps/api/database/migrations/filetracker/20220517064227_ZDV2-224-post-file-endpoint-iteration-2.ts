import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('datafiles', (table) => {
    table.enum('ref_genome', [
      'hs38',
      'hg19lite',
      'hs37d5',
      'hg19',
      'hg38',
      'GRCh37',
      'GRCh38fullphix',
      'GRCh38lite',
      'GRCh37illumina'
    ])
    .alter();
  })
}


export async function down(knex: Knex): Promise<void> {
}