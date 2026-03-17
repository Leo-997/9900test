/* eslint-disable no-console */
import { knex } from 'knex';
import xlsx from 'node-xlsx';
import { knexConnectionConfig } from '../../../knexfile';

const zdKnex = knex(knexConnectionConfig);
const curationCommentTable = 'zcc_curation_comment';
const FILE_PATH = 'input/pathway-comments_retagged.xlsx';

async function updateCurationCommentType(): Promise<void> {
  console.log('Running script...');
  try {
    console.log('Updating renamed tags');

    const mutationCount = await zdKnex
      .update({ type: 'ALTERATION' })
      .where('type', 'MUTATION')
      .from(curationCommentTable);

    const therapeuticCount = await zdKnex
      .update({ type: 'THERAPEUTIC' })
      .whereIn('type', ['TARGETABILITY', 'TREATMENT', 'TRIAL'])
      .from(curationCommentTable);

    console.log(`Updated type for ${mutationCount + therapeuticCount} rows.`);

    console.log('Updating value for removed tags, according to spreadsheet');
    const rawSheets = xlsx.parse(FILE_PATH);
    const sheet = rawSheets[0].data;

    if (!sheet) {
      throw new Error(`Sheet not found in ${FILE_PATH}`);
    }

    const spreadsheetRows = sheet
      .slice(1) // skip sheet's header
      .map((row) => ({
        id: row[0],
        type: row[1],
      }))
      .filter((row) => row.id && row.type);

    console.log(`Updating ${spreadsheetRows.length} rows from spreadsheet`);
    await Promise.all(
      spreadsheetRows.map((spreadsheet) => zdKnex
        .update({ type: spreadsheet.type })
        .where({ id: spreadsheet.id })
        .from(curationCommentTable)),
    );
    console.log(`Successfully updated ${spreadsheetRows.length} rows`);
    console.log('zcc_curation_comment "type" column successfully updated');
    process.exit(0);
  } catch (error) {
    console.error('Error updating zcc_curation_comment.type:', error);
    process.exit(1);
  }
}

updateCurationCommentType();
