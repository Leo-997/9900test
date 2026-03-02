import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_slides").del();

  // Inserts seed entries
  await knex("zcc_clinical_slides").insert([
    {
      id: "test-id1",
      index: 0,
      title: "test-title1",
      slide_note: "test-description1",
      report_note: "report note 1",
      mol_alteration_group_id: "1",
      is_hidden: false,
    },
    {
      id: "test-id2",
      index: 1,
      title: "test-title2",
      slide_note: "test-description2",
      report_note: "report note 2",
      mol_alteration_group_id: "2",
      is_hidden: false,
    },
    {
      id: "test-id3",
      index: 2,
      title: "test-title3",
      slide_note: "test-description3",
      report_note: "report note 3",
      mol_alteration_group_id: "3",
      is_hidden: true,
    },
    {
      id: "test-id4",
      index: 3,
      title: "test-title4",
      slide_note: "test-description4",
      report_note: "report note 4",
      mol_alteration_group_id: "4",
      is_hidden: false,
    },
  ]);
};
