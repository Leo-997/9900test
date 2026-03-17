import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_sample_signatures',
    function createSampleSigTbl(table) {
      table.string('sample_id', 150).primary();

      table.specificType('sig1', 'double').defaultTo(null);
      table.specificType('sig2', 'double').defaultTo(null);
      table.specificType('sig3', 'double').defaultTo(null);
      table.specificType('sig4', 'double').defaultTo(null);
      table.specificType('sig5', 'double').defaultTo(null);
      table.specificType('sig6', 'double').defaultTo(null);
      table.specificType('sig7', 'double').defaultTo(null);
      table.specificType('sig8', 'double').defaultTo(null);
      table.specificType('sig9', 'double').defaultTo(null);
      table.specificType('sig10', 'double').defaultTo(null);
      table.specificType('sig11', 'double').defaultTo(null);
      table.specificType('sig12', 'double').defaultTo(null);
      table.specificType('sig13', 'double').defaultTo(null);
      table.specificType('sig14', 'double').defaultTo(null);
      table.specificType('sig15', 'double').defaultTo(null);
      table.specificType('sig16', 'double').defaultTo(null);
      table.specificType('sig17', 'double').defaultTo(null);
      table.specificType('sig18', 'double').defaultTo(null);
      table.specificType('sig19', 'double').defaultTo(null);
      table.specificType('sig20', 'double').defaultTo(null);
      table.specificType('sig21', 'double').defaultTo(null);
      table.specificType('sig22', 'double').defaultTo(null);
      table.specificType('sig23', 'double').defaultTo(null);
      table.specificType('sig24', 'double').defaultTo(null);
      table.specificType('sig25', 'double').defaultTo(null);
      table.specificType('sig26', 'double').defaultTo(null);
      table.specificType('sig27', 'double').defaultTo(null);
      table.specificType('sig28', 'double').defaultTo(null);
      table.specificType('sig29', 'double').defaultTo(null);
      table.specificType('sig30', 'double').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

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
