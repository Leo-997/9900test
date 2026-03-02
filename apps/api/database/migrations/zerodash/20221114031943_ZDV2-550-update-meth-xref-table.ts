import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_methylation_group', table => {
    table.uuid('meth_group_id').notNullable().primary();
    table.string('meth_class_id', 50).nullable().defaultTo(null);
    table.uuid('meth_classifier_id').notNullable();
    table.string('group_name', 200).notNullable();
    table.integer('external_group_id').nullable().defaultTo(null);
    table.string('meth_class', 200).nullable();
    table.string('meth_family', 200).nullable();
    table.string('meth_superfamily', 200).nullable();
    table.text('meth_summary');
    table.text('meth_evidence');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by').nullable().defaultTo(null);
    table.string('updated_by').nullable().defaultTo(null);

    table.index(['meth_classifier_id'], 'zcc_methylation_xref_classifier_idx');
    table.foreign('meth_classifier_id')
      .references('meth_classifier_id')
      .inTable('zcc_methylation_classifier');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

