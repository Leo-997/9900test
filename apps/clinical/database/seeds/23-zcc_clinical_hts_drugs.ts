import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_hts_drugs").del();

  // Inserts seed entries
  await knex("zcc_clinical_hts_drugs").insert([
    {
      id: "1",
      sample_id: "LKCGP-P009102-326840-01-04-01-D1",
      hts_id: "1",
      drug_id: "1",
      drug_name: "Test drug 1",
      targets: "Test targets 1",
      reportable: "Test reportable 1",
      reported_as: "Test reported as 1",
      file_id: "Test file id 1",
      created_by: "3b4f6544-acc8-4df2-a7c5-27fcc4527d17"
    },
    {
      id: "2",
      sample_id: "LKCGP-P009102-326840-01-04-01-D1",
      hts_id: "2",
      drug_id: "2",
      drug_name: "Test drug 2",
      targets: "Test targets 2",
      reportable: "Test reportable 2",
      reported_as: "Test reported as 2",
      file_id: "Test file id 2",
      created_by: "3b4f6544-acc8-4df2-a7c5-27fcc4527d17"
    },
    {
      id: "3",
      sample_id: "LKCGP-P009102-326840-01-04-01-D1",
      hts_id: "3",
      drug_id: "3",
      drug_name: "Test drug 3",
      targets: "Test targets 3",
      reportable: "Test reportable 3",
      reported_as: "Test reported as 3",
      file_id: "Test file id 3",
      created_by: "3b4f6544-acc8-4df2-a7c5-27fcc4527d17"
    },
  ]);
};
