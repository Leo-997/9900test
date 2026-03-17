import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curated_sample_somatic_rnaseq_classification', (table) => {
    table.string('rnaseq_id', 150).notNullable();
    table.enum('classifier', ['ALLSorts', 'TALLSorts']).notNullable();
    table.string('version', 10).defaultTo(null);
    table.string('prediction', 45).notNullable();
    table.float('score').defaultTo(null);
    table.boolean('selected_prediction').defaultTo(null);
    table.string('classification', 45).defaultTo(null);
    table.boolean('reportable').defaultTo(null);
    table.boolean('in_molecular_report').defaultTo(null);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by').defaultTo(null);

    table.primary(
      ['rnaseq_id', 'classifier', 'version', 'prediction'],
      'rnaseq_classification_primary',
    );

    table
      .foreign('rnaseq_id', 'rnaseq_classification_rnaseq_id_fk')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
export async function down(knex: Knex): Promise<void> {
}
