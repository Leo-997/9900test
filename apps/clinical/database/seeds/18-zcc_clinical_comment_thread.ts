import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Inserts seed entries
  await knex("zcc_clinical_comment_thread").insert([
    { comment_thread_id: "1", clinical_version_id: "1", created_by: "user1" },
  ]);
}
