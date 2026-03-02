import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_patients', table => {
    table.string('vital_status', 50).after('viral_status').nullable()
  })
  .then(async () => {
    await knex.schema.alterTable('zcc_clinical_patients', table => {
      table.dropColumn('viral_status')
    })
  })
}


export async function down(knex: Knex): Promise<void> {
}

