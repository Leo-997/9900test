import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_rna_relapse_comparison', (table) => {
    table.string('biosample_id', 150).notNullable();
    table.string('relapse_biosample_id', 150).notNullable();
    table.integer('gene_id').unsigned().notNullable();
    table.float('fold_change').defaultTo(null);
    table.double('q_value').defaultTo(null);
    table.boolean('outlier').defaultTo(null);

    table.primary(['biosample_id', 'relapse_biosample_id', 'gene_id']);
    table
      .foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table
      .foreign('relapse_biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table
      .foreign('gene_id')
      .references('gene_id')
      .inTable('zcc_genes')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
