import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Inserts seed entries
  await knex("zcc_comment_thread").insert([{ id: "1", created_by: "user1" }]);
}
