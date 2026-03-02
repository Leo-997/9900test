/* eslint-disable no-console */
import { knex } from 'knex';
import xlsx from 'node-xlsx';
import { knexConnectionConfig } from '../../../knexfile';

type Spreadsheet = {
  name: string;
  data: string[][]
}

const zdKnex = knex(knexConnectionConfig);
const rnaPredictionsTable = 'zcc_rna_classification_predictions';
const FILE_PATH = 'input/prediction_mapping.xlsx';

async function populatePredictionLabel(): Promise<void> {
  console.log('Running script...');
  try {
    console.log(`Populating prediction_label on ${rnaPredictionsTable}`);

    // Create a prediction to prediction_label map from spreadsheet
    const sheet: Spreadsheet[] = xlsx.parse(FILE_PATH);
    const spreadsheetRows = sheet[0]?.data
      .slice(1) // skip header
      .filter((r) => r[0] !== null); // safeguard for null predictions

    if (!spreadsheetRows) {
      throw new Error(`Sheet not found in ${FILE_PATH}`);
    }

    const predictionMap: Record<string, string> = Object.fromEntries(spreadsheetRows);

    // Update rnaPredictionsTable
    const rowsToUpdate = await zdKnex
      .select('prediction')
      .from(rnaPredictionsTable)
      .whereNull('prediction_label');

    console.log(`Updating ${rowsToUpdate.length} rows...`);
    
    for (const { prediction } of rowsToUpdate) {
      const label = predictionMap[prediction];
      if (!label) continue;

      await zdKnex
        .update({ prediction_label: label })
        .from(rnaPredictionsTable)
        .where({ prediction })
    }
   
    console.log(`Successfully updated ${rowsToUpdate.length} rows`);
    console.log(`Successfully updated prediction labels on ${rnaPredictionsTable}`);
    await zdKnex.destroy();
    process.exit(0);
  } catch (error) {
    console.error(`Error updating ${rnaPredictionsTable}` , error);
    process.exit(1);
  }
}

populatePredictionLabel();
