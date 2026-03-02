import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_addendum").del();

  // Inserts seed entries
  await knex("zcc_clinical_addendum").insert([
    {
      id: "1",
      clinical_history: "Test clinical history 1",
      title: "Test title 1",
      note: "Test note 1",
      discussion_title: "Test discussion title 1",
      discussion_note: "Test discussion note 1",
      clinical_version_id: "1",
      addendum_type: "hts",
      created_by: "3b4f6544-acc8-4df2-a7c5-27fcc4527d17"
    },
    {
      id: "2",
      clinical_history: "Test clinical history 2",
      title: "Test title 2",
      note: "Test note 2",
      discussion_title: "Test discussion title 2",
      discussion_note: "Test discussion note 2",
      clinical_version_id: "1",
      addendum_type: "general",
      created_by: "3b4f6544-acc8-4df2-a7c5-27fcc4527d17"
    },
    {
      id: "3",
      clinical_history: "Test clinical history 3",
      title: "Test title 3",
      note: "Test note 3",
      discussion_title: "Test discussion title 3",
      discussion_note: "Test discussion note 3",
      clinical_version_id: "1",
      addendum_type: "general",
      created_by: "3b4f6544-acc8-4df2-a7c5-27fcc4527d17"
    },
  ]);
};
