import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_pipelines", (table) => {
    table.increments("pipeline_id").primary();
    table.string("biosample_id", 150).nullable();
    table.string("pipeline_name", 45).nullable();
    table.string("pipeline_vers", 10).nullable();
    table.date("run_date").nullable();
    table.string("task_id", 50).nullable();
    table.string("task_status", 20).nullable();
    table.integer("manifest_id").unsigned().nullable();

    table.foreign("manifest_id").references("manifest_id").inTable("zcc_manifest");
    table.unique(["pipeline_id"]);
    table.index(["manifest_id"], "zcc_pipeline_manifest_idx");

    table.engine("InnoDB");
    table.charset("utf8");
  });
}


export async function down(knex: Knex): Promise<void> {
}

