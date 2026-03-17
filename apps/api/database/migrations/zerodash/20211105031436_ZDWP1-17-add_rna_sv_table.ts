import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_sample_somatic_rnaseq_sv',
    function createRnaseqSvTbl(table) {
      table.string('rnaseq_id').notNullable();
      table.integer('variant_id').unsigned().notNullable();
      table.string('algorithm').notNullable();
      table.string('confidence').defaultTo(null);
      table.string('inframe').defaultTo(null);

      table.primary(['rnaseq_id', 'variant_id', 'algorithm']);
      
      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
