import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('netapp', (table) => {
    table.string("key", 255).alter();
  })
  .then(() => {
    return knex.schema.alterTable("datafiles", (table) => {
      table.enum("filetype", ['tar','bam','bai','fastq',
        'json','vcf','gvcf','metrics','png', 'gzip']).alter();
    });
  });
}


export async function down(knex: Knex): Promise<void> {
}