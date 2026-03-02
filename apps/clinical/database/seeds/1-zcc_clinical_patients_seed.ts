import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
	// Deletes ALL existing entries
	await knex("zcc_clinical_patients").del();

	// Inserts seed entries
	await knex("zcc_clinical_patients").insert([
		{
			patient_id: "P009102",
			zcc_subject_id: "zccs516",
			sex: "Female",
			age_at_diagnosis: 14,
			vital_status: "Alive",
			hospital: "Children's Hospital Westmead",
			enrolment_date: "2020-12-30 11:00:00"
		}
	]);
};
