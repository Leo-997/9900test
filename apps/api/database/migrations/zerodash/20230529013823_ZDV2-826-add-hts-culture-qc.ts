import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_culture', (table) => {
    table.integer('qc_pc_cnt');
    table.integer('qc_nc_cnt');
    table.integer('qc_l1_cnt');
    table.double('qc_l1_r');
    table.integer('qc_l2_cnt');
    table.double('qc_l2_r');
    table.integer('qc_l3_cnt');
    table.double('qc_l3_r');
    table.integer('qc_l4_cnt');
    table.double('qc_l4_r');
    table.string('qc_status', 50);
    table.text('qc_comment');
  });
}

export async function down(knex: Knex): Promise<void> {
}
