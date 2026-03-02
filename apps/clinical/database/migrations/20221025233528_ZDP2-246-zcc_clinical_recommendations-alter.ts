import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_recommendations", (table) => {
    table.boolean("known_to_CCGS").defaultTo(null).after("tier");
    table.boolean("clinical_confirmation").defaultTo(null).after("known_to_CCGS");
    table.boolean("referral_to_CGS_counselling").defaultTo(null).after("clinical_confirmation");
    table.boolean("screen_program_available").defaultTo(null).after("referral_to_CGS_counselling");
  });
}


export async function down(knex: Knex): Promise<void> {
}

