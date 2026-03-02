import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable("zcc_clinical_drug_trials", (table) => {
    table.string("id").primary();
    table.string("drug_id").notNullable();
    table.string("trial_id");
    table.string("internal_trial_id").notNullable();
    table.string("trial_name").notNullable();
    table.string("trial_phase_id");
    table.integer("trial_phase").notNullable();
    table.string("trial_phase_name");
    table.boolean("requires_approval");
    table.text("note");

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by").nullable();
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.string("updated_by").nullable();

    table
      .foreign("drug_id")
      .references("zcc_clinical_drugs.id")
      .onDelete("RESTRICT")
      .onUpdate("RESTRICT");

    table.engine("InnoDB");
    table.charset("utf8");
  });
}

export async function down(knex: Knex): Promise<void> {}
