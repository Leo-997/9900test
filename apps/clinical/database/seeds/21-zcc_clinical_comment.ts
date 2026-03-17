import { Knex } from "knex";
// import { SlideType } from "../../Models";

export async function seed(knex: Knex): Promise<void> {
  // Inserts seed entries
  await knex("zcc_clinical_comment").insert([
    {
      id: "1",
      entity_type: "DIAGNOSIS",
      comment_id: "1",
      clinical_comment_thread_id: "1",
      created_by: "user1",
    },
  ]);
}
