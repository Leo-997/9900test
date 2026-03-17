import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_approvals", (table) => {
    table.uuid("id").primary().notNullable();
    table.string("type", 50).notNullable();
    table.string("status", 50).notNullable();
    table.integer("request_number").defaultTo(0);
    table.string("sample_id").notNullable();
    table.string("role").nullable();
    table.string("assignee").nullable();
    table.string("approved_by").nullable();
    table.timestamp("approved_at").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by").notNullable();
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.string("updated_by").notNullable();

    table.foreign("sample_id").references("sample_id").inTable("zcc_sample");
    table.foreign("role").references("id").inTable("zcc_roles");
    table.foreign("assignee").references("id").inTable("zcc_users");
    table.foreign("approved_by").references("id").inTable("zcc_users");
    table.foreign("created_by").references("id").inTable("zcc_users");
    table.foreign("updated_by").references("id").inTable("zcc_users");

    table.engine("InnoDB");
    table.charset("utf8");
  });
}


export async function down(knex: Knex): Promise<void> {
}

