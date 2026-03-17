/* eslint-disable no-console */
import knex from 'knex';
import { v4 as uuid } from 'uuid';
import { knexConnectionConfig } from '../../../knexfile';

const clinicalKnex = knex(knexConnectionConfig);

interface IImmunoProfile {
  ipassValue: number | null;
  ipassStatus: string | null;
}

interface IInsertedAlteration {
  molAlterationId: string;
  mutationId: string | number;
  clinicalVersionId: string;
}

const molecularAlterationTable = 'zcc_clinical_mol_alterations';
const clinicalVersionTable = 'zcc_clinical_versions';
const analysisSetXrefTable = 'zcczerodashhg38.zcc_analysis_set_biosample_xref';
const biosampleTable = 'zcczerodashhg38.zcc_biosample';
const immunoTable = 'zcczerodashhg38.zcc_curated_sample_immunoprofile';

async function getRNABiosampleId(analysisSetId: string): Promise<string> {
  const rnaBiosample = await clinicalKnex
    .select({
      biosampleId: 'biosample.biosample_id',
    })
    .from({ xref: analysisSetXrefTable })
    .innerJoin({ biosample: biosampleTable }, 'biosample.biosample_id', 'xref.biosample_id')
    .where('xref.analysis_set_id', analysisSetId)
    .andWhere('biosample.sample_type', 'rnaseq')
    .first();
  return rnaBiosample?.biosampleId;
}

async function getImmunoProfile(
  biosampleId: string,
): Promise<IImmunoProfile> {
  return clinicalKnex
    .select({
      ipassValue: 'immuno.ipass_value',
      ipassStatus: 'immuno.ipass_status',
    })
    .from({ immuno: immunoTable })
    .where('biosample_id', biosampleId)
    .first();
}

async function importImmunoProfile(
  immunoProfile: IImmunoProfile,
  clinicalVersionId: string,
): Promise<IInsertedAlteration> {
  const { ipassStatus, ipassValue } = immunoProfile;
  const displayStatus = ipassStatus ?? '';
  let displayValue = ipassValue ?? '';
  displayValue = displayValue !== '' && displayStatus ? `(${displayValue})` : displayValue;
  let ipass = `${displayStatus} ${displayValue}`.trim() || '-';
  if (ipass === '-') ipass = null;
  const id = uuid();

  const result = await clinicalKnex
    .insert({
      id,
      mutation_id: ipassStatus,
      mutation_type: 'IPASS',
      additional_data: JSON.stringify({
        ipassValue,
        ipassStatus,
      }),
      alteration: ipass,
      description: ipass,
      clinical_version_id: clinicalVersionId,
      created_at: clinicalKnex.fn.now(),
    })
    .into(molecularAlterationTable);

  if (result && result.length > 0) {
    return {
      molAlterationId: id,
      mutationId: ipassStatus,
      clinicalVersionId,
    };
  }

  throw new Error('Incorrect format for the immuno profile.');
}

async function importIPASSMolAlterations(): Promise<IInsertedAlteration[]> {
  const clinicalVersions = await clinicalKnex
    .select({
      id: 'v.id',
      analysisSetId: 'v.analysis_set_id',
    })
    .from({ v: clinicalVersionTable })
    .whereNotExists(function isIPASS() {
      this.select('*')
        .from({ a: molecularAlterationTable })
        .whereRaw('a.clinical_version_id = v.id')
        .andWhere('a.mutation_type', 'IPASS');
    });

  return Promise.all(clinicalVersions.map(async (version): Promise<IInsertedAlteration> => {
    const { id: versionId, analysisSetId } = version;
    const rnaBiosampleId = await getRNABiosampleId(analysisSetId);
    if (rnaBiosampleId) {
      const immunoProfile = await getImmunoProfile(rnaBiosampleId);
      if (immunoProfile) {
        return importImmunoProfile(immunoProfile, versionId);
      }
    }
    return null;
  })).then((results) => results.filter(Boolean) as IInsertedAlteration[]);
}

async function loadIPASSMolAlterations(): Promise<void> {
  console.log('Loading data..');
  try {
    const results = await importIPASSMolAlterations();
    console.log(`Inserted ${results.length} IPASS Alterations:`, results);
  } catch (error) {
    console.error('Error importing IPASS alterations:', error);
  } finally {
    process.exit();
  }
}

loadIPASSMolAlterations();
