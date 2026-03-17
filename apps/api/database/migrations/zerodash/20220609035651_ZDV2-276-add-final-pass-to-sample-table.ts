import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.integer('final_pass', 11).defaultTo(null);
  })
  .then(async () => {
    const finalPassValues = await knex.select({
      sampleId: 'sample_id',
      finalPass: 'final_pass',
    })
    .from<{sampleID: string, finalPass: number}>('zcc_filtered_somatic_variants');
    for (const finalPass of finalPassValues) {
      await knex('zcc_sample')
        .where('sample_id', finalPass.sampleId)
        .update({ final_pass: finalPass.finalPass });
    }
  })
  .then(async () => {
    await knex.schema.dropTable('zcc_filtered_somatic_variants');
  });
}


export async function down(knex: Knex): Promise<void> {
}

