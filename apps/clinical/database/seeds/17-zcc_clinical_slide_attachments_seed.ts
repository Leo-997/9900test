import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_slide_attachments").del();

  // Inserts seed entries
  await knex("zcc_clinical_slide_attachments").insert([
    {
      slide_id: "test-id1",
      file_id: "1",
      file_type: "jpg",
      title:"gene1",
      caption:"TPM Graph"
    },
  ]);
}
