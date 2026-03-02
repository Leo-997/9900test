import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_drugs', function createZccDrugs(table) {
    table.increments('drug_id');
    table.string('drug_name', 100).defaultTo(null).unique();
    table.string('synonyms', 500).defaultTo(null);
    table.string('category', 25).defaultTo(null);
    table.string('company', 100).defaultTo(null);
    table.float('mol_weight', 10, 5).defaultTo(null);
    table.string('cci_drug_id', 25).defaultTo(null);
    table.string('drugname_cci', 100).defaultTo(null);
    table.string('drugname_pmc', 100).defaultTo(null);
    table.string('drugname_compasslib', 100).defaultTo(null);
    table.string('drug_target', 120).defaultTo(null);
    table.string('drug_pathwayclass', 100).defaultTo(null);
    table.string('drug_type', 100).defaultTo(null);
    table.string('drug_class', 100).defaultTo(null);
    table.boolean('cci').defaultTo(null);
    table.boolean('pmc').defaultTo(null);
    table.string('prodrug', 250).defaultTo(null);
    table.boolean('combination').defaultTo(null);
    table.string('combo_type', 20).defaultTo(null);
    table.string('clinical_trial', 50).defaultTo(null);
    table.text('comments').defaultTo(null);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by');
    table.string('updated_by');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
