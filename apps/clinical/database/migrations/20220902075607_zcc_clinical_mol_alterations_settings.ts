import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(
    "zcc_clinical_mol_alterations_settings",
    (table) => {
      table.string("id").primary().notNullable();
      table.string("clinical_version_id").notNullable();
      table.boolean("show_gene").defaultTo(true);
      table.boolean("show_alteration").defaultTo(true);
      table.boolean("show_rna_exp").defaultTo(true);
      table.boolean("show_pathway").defaultTo(true);
      table.boolean("show_reported_as").defaultTo(true);
      table.boolean("show_targeted").defaultTo(true);
      table.boolean("show_mutation_type").defaultTo(false);
      table.boolean("show_frequency").defaultTo(false);
      table.boolean("show_high_relapse_risk").defaultTo(false);
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
      table.string("updated_by").nullable();

      table.index("clinical_version_id", "clinical_version_id_mol");

      table
        .foreign("clinical_version_id", "clinical_version_id_mol")
        .references("zcc_clinical_versions.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");

      table.engine("InnoDB");
      table.charset("utf8");
    }
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("zcc_clinical_mol_alterations_settings");
}
