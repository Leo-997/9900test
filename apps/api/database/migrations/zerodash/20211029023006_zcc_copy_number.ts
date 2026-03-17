import { Knex } from "knex";


// id - int(11) AI PK
// modified - datetime
// sampleId - varchar(255)
// chromosome - varchar(255)
// start - int(11)
// end - int(11)
// segmentStartSupport - varchar(255)
// segmentEndSupport - varchar(255)
// depthWindowCount - int(11)
// bafCount - int(11)
// observedBaf - double
// baf - double
// copyNumber - double
// minorAlleleCopyNumber - double
// majorAlleleCopyNumber - double
// copyNumberMethod - varchar(255)
// gcContent - double
// minStart - int(11)
// maxStart - int(11)

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    `zcc_purple_sample_somatic_cnv`,
    function createTbl(table) {
      table.increments('id').primary();
      table.timestamp('modified').notNullable().defaultTo(knex.fn.now());
      table.string('sampleId', 150).notNullable();
      table.string('chromosome', 255).notNullable();
      table.integer('start', 11).notNullable();
      table.integer('end', 11).notNullable();
      table.string('segmentStartSupport', 255).notNullable();
      table.string('segmentEndSupport', 255).notNullable();
      table.integer('depthWindowCount', 11).notNullable();
      table.integer('bafCount', 11).notNullable();
      table.double('observedBaf').notNullable();
      table.double('baf').notNullable();
      table.double('copyNumber').notNullable();
      table.double('minorAlleleCopyNumber').notNullable();
      table.double('majorAlleleCopyNumber').notNullable();
      table.string('copyNumberMethod', 255).notNullable();
      table.double('gcContent').notNullable();
      table.integer('minStart', 11).notNullable();
      table.integer('maxStart', 11).notNullable();

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}


export async function down(knex: Knex): Promise<void> {
}

