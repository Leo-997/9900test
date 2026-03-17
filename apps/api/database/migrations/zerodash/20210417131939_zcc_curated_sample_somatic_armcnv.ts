import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_sample_somatic_armcnv',
    function createSomaticArmCnvTbl(table) {
      table.string('sample_id', 150).notNullable();

      table.string('chr', 15).notNullable();
      table.enum('arm', ['p', 'q', 'centromere', 'telomere']).notNullable();
      table.string('cytoband', 500).notNullable();
      table.specificType('avecopynumber', 'double').defaultTo(null);
      table.string('reportable').defaultTo(null);
      table.boolean('targetable').defaultTo(null);
      table.string('evidence', 4000).defaultTo(null);
      table.text('curator_summary').defaultTo(null);
      table.text('comments').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.primary(['sample_id', 'chr', 'arm']);

      table.index('sample_id');

      table
        .foreign('sample_id')
        .references('zcc_sample.sample_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
