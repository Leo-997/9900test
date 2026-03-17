import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable(
      'zcc_curated_sample_somatic_armcnv',
      function addCnTypeToArmcnv(table) {
        table
          .string('cn_type', 255)
          .defaultTo('NEU')
          .notNullable()
          .after('arm');
      },
    )
    .then(() =>
      knex.schema.alterTable(
        'zcc_curated_somatic_armcnv_counts',
        function addCnTypeToArmcnv(table) {
          table
            .string('cn_type', 255)
            .defaultTo('NEU')
            .notNullable()
            .after('arm');
        },
      ),
    );
}

export async function down(knex: Knex): Promise<void> {}
