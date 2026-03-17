/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
import { knex } from 'knex';
import xlsx from 'node-xlsx';
import { knexConnectionConfig } from '../../../knexfile';

interface ISheet {
  name: string;
  data: (string | number)[][];
}

const ucscChromosomeBandsTable = 'ucsc_chromosome_bands';
const FILE_NAME = '../../../input_files/ucsc_chromosome_bands.xlsx'; // input file, found in BIXENG-3664
const SHEET_NAME = 'ucsc_chromosome_bands';

const zdKnex = knex(knexConnectionConfig);

async function loadUCSCData(): Promise<void> {
  try {
    const rawSheet = xlsx.parse(FILE_NAME);
    const sheet = rawSheet.find((s) => s.name === SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found in ${FILE_NAME}`);
    }

    const { data: rawData } = sheet as ISheet;

    const payload = rawData.map((row) => ({
      chromosome: row[0],
      chrom_start: row[1],
      chrom_end: row[2],
      name: row[3],
      gie_stain: row[4],
      assembly: row[5],
    }));
    console.log(payload);
    await zdKnex
      .insert(payload)
      .into(ucscChromosomeBandsTable)
      .onConflict(['chromosome', 'name'])
      .ignore();

    console.log('Data successfully inserted');
  } catch (error) {
    console.error('Error inserting XLSX data:', error);
    process.exit(1);
  }

  process.exit(0);
}

loadUCSCData();
