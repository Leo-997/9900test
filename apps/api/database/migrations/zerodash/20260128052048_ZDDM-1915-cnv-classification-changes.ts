import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_curated_sample_somatic_cnv', (table) => {
    table.string('cn_type_auto', 50);
  })
    .then(() => knex('zcc_curated_sample_somatic_cnv').update('cn_type_auto', knex.ref('cn_type')))
    .then(() => knex('zcc_curated_sample_somatic_cnv')
      .update({ cn_type: null })
      .where(function isNotCurated() {
        this.whereNull('classification').andWhere('pathclass', null).andWhere('reportable', null);
      }));
}

export async function down(knex: Knex): Promise<void> {
}
