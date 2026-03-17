import { Chromosome, PathClass } from '../../types/Common.types';
import {
  IAnnotations,
  ICytogeneticsData,
  IParsedCytogeneticsData,
} from '../../types/Cytogenetics.types';

function mapPathclass(pathclass: string | null): number {
  switch (pathclass) {
    case 'C5: Pathogenic':
      return 0;
    case 'C4: Likely Pathogenic':
      return 1;
    case 'C3.8: VOUS':
      return 2;
    case 'C3: VOUS':
      return 3;
    case 'C2: Likely Benign':
      return 4;
    case 'C1: Benign':
      return 5;
    case 'False Positive':
      return 6;
    case 'Unclassified':
      return 7;
    default:
      return -1;
  }
}

export const parseCytoData = (
  data: ICytogeneticsData[],
  annoData: IAnnotations = { copyNumber: [], reportableSnvs: [] },
): IParsedCytogeneticsData[] => {
  const { copyNumber, reportableSnvs } = annoData;
  const newData: IParsedCytogeneticsData[] = [];
  for (let i = 1; i < 23; i += 1) {
    newData.push({
      chr: `chr${i}` as Chromosome,
      cytoband: '',
      p: {
        cnType: '',
        avgCN: 2.0,
        reportable: null,
        targetable: null,
        classification: null,
        reportedCount: 0,
        targetableCount: 0,
        aveMinMinorAlleleCN: 0.5,
        researchCandidate: null,
      },
      q: {
        cnType: '',
        avgCN: 2.0,
        classification: null,
        reportable: null,
        targetable: null,
        reportedCount: 0,
        targetableCount: 0,
        aveMinMinorAlleleCN: 0.5,
        researchCandidate: null,
      },
      annotations: [],
    });
  }

  newData.push({
    chr: 'chrX',
    cytoband: '',
    p: {
      cnType: '',
      avgCN: 2.0,
      reportable: null,
      targetable: null,
      classification: null,
      reportedCount: 0,
      targetableCount: 0,
      aveMinMinorAlleleCN: 0.5,
      researchCandidate: null,
    },
    q: {
      cnType: '',
      avgCN: 2.0,
      reportable: null,
      targetable: null,
      classification: null,
      reportedCount: 0,
      targetableCount: 0,
      aveMinMinorAlleleCN: 0.5,
      researchCandidate: null,
    },
    annotations: [],
  });
  // Add Y chromosome to newData if patient isnt female (male, multi, unknown, null)
  if (data.length && data[0].sex !== 'Female') {
    newData.push({
      chr: 'chrY',
      cytoband: '',
      p: {
        cnType: '',
        avgCN: 2.0,
        reportable: null,
        targetable: null,
        reportedCount: 0,
        targetableCount: 0,
        classification: null,
        aveMinMinorAlleleCN: 0.5,
        researchCandidate: null,
      },
      q: {
        cnType: '',
        avgCN: 2.0,
        reportable: null,
        targetable: null,
        reportedCount: 0,
        targetableCount: 0,
        classification: null,
        aveMinMinorAlleleCN: 0.5,
        researchCandidate: null,
      },
      annotations: [],
    });
  }

  const annotations: Record<string | number, (string | number | undefined)[][]> = {};

  // Prepare CN + LOH heatmaps for annotations
  for (let i = 0; i < copyNumber.length; i += 1) {
    const newAnnot = {
      name: `CN: ${copyNumber[i].cn}`,
      start: copyNumber[i].start,
      length: copyNumber[i].end - copyNumber[i].start,
      cn: copyNumber[i].cn,
      loh: copyNumber[i].lohValue < 0.5 ? 1 : 0,
      pathclass: -1,
    };
    if (copyNumber[i].chr in annotations) {
      annotations[copyNumber[i].chr].push(Object.values(newAnnot));
    } else {
      annotations[copyNumber[i].chr] = [Object.values(newAnnot)];
    }
  }

  // Prepare reportable SNVs heatmap for annotations
  for (let i = 0; i < reportableSnvs.length; i += 1) {
    const newAnnot = {
      name: `Pathclass: ${reportableSnvs[i].pathclass}<br/>
        HGVs: ${reportableSnvs[i].hgvs}`,
      start: reportableSnvs[i].start,
      length: 1,
      cn: undefined,
      loh: undefined,
      pathclass: mapPathclass(reportableSnvs[i].pathclass as PathClass),
    };
    if (reportableSnvs[i].chr in annotations) {
      annotations[reportableSnvs[i].chr].push(Object.values(newAnnot));
    } else {
      annotations[reportableSnvs[i].chr] = [Object.values(newAnnot)];
    }
  }
  // Find respective object in newData and update
  for (const obj of data) {
    for (let j = 0; j < newData.length; j += 1) {
      if (obj.chr === newData[j].chr) {
        // Adding CN, reportable, targetable, counts to each arm
        newData[j].cytoband = obj.cytoband;
        if (obj.arm === 'p') {
          newData[j].p.cnType = obj.cnType;
          newData[j].p.avgCN = obj.avgCN;
          newData[j].p.aveMinMinorAlleleCN = obj.aveMinMinorAlleleCN;
          newData[j].p.researchCandidate = obj.researchCandidate;
          newData[j].p.classification = obj.classification;
          newData[j].p.reportable = obj.reportable;
          newData[j].p.targetable = obj.targetable;
          newData[j].p.reportedCount = obj.reportedCount
            ? obj.reportedCount
            : 0;
          newData[j].p.targetableCount = obj.targetableCount
            ? obj.targetableCount
            : 0;
        } else if (obj.arm === 'q') {
          newData[j].q.cnType = obj.cnType;
          newData[j].q.avgCN = obj.avgCN;
          newData[j].q.aveMinMinorAlleleCN = obj.aveMinMinorAlleleCN;
          newData[j].q.researchCandidate = obj.researchCandidate;
          newData[j].q.classification = obj.classification;
          newData[j].q.reportable = obj.reportable;
          newData[j].q.targetable = obj.targetable;
          newData[j].q.reportedCount = obj.reportedCount
            ? obj.reportedCount
            : 0;
          newData[j].q.targetableCount = obj.targetableCount
            ? obj.targetableCount
            : 0;
        }
      }
    }
  }

  for (let j = 0; j < newData.length; j += 1) {
    newData[j].annotations = annotations[newData[j].chr] as (string | number)[][];
  }

  return newData;
};
