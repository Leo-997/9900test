import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_somatic_armcnv_counts', table => {
    table.dropForeign(['chr', 'arm', 'cn_type'], 'zcc_curated_somatic_armcnv_counts_chr_arm_cn_type_foreign');
  })
  .catch(() => {
    console.log('zcc_curated_somatic_armcnv_counts_chr_arm_cn_type_foreign does not exist');
  });
}


export async function down(knex: Knex): Promise<void> {
}

