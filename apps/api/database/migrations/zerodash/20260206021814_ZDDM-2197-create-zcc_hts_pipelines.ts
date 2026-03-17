import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('zcc_hts_pipelines', (table) => {
        table.string('pipeline_id', 26).notNullable();
        table.string('biosample_id', 150).notNullable();
        table.string('pipeline_name', 45).notNullable();
        table.string('pipeline_vers', 10).notNullable();
        table.tinyint('number_of_plates', 1).defaultTo(null);
        table.timestamp('start_on').notNullable();
        table.timestamp('end_on').defaultTo(null);
        table.string('started_by', 255).notNullable;
        table
          .enum('task_status', ['COMPLETED', 'FAILED', 'ABORTED', 'DRAFT', 'RUNNING'])
          .defaultTo(null);
        table.tinyint('qc_l1_cnt').unsigned().defaultTo(null);
        table.double('qc_l1_r').unsigned().defaultTo(null);
        table.double('qc_l1_zprime_rep1').unsigned().defaultTo(null);
        table.double('qc_l1_zprime_rep2').unsigned().defaultTo(null);

        table.tinyint('qc_l2_cnt').unsigned().defaultTo(null);
        table.double('qc_l2_r').unsigned().defaultTo(null);
        table.double('qc_l2_zprime_rep1').unsigned().defaultTo(null);
        table.double('qc_l2_zprime_rep2').unsigned().defaultTo(null);

        table.tinyint('qc_l3_cnt').unsigned().defaultTo(null);
        table.double('qc_l3_r').unsigned().defaultTo(null);
        table.double('qc_l3_zprime_rep1').unsigned().defaultTo(null);
        table.double('qc_l3_zprime_rep2').unsigned().defaultTo(null);

        table.tinyint('qc_l4_cnt').unsigned().defaultTo(null);
        table.double('qc_l4_r').unsigned().defaultTo(null);
        table.double('qc_l4_zprime_rep1').unsigned().defaultTo(null);
        table.double('qc_l4_zprime_rep2').unsigned().defaultTo(null);

        table.primary(['pipeline_id']);
        table.index(['biosample_id'], 'zcc_hts_pipelines_biosample_fk_idx');
        table.index(['started_by'], 'zcc_hts_qc_logs_user');

        table
          .foreign('biosample_id', 'zcc_hts_pipelines_biosample_fk')
          .references('zcc_biosample.biosample_id');
        

        table.engine('InnoDB');
        table.charset('utf8mb3');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('zcc_hts_pipelines');
}