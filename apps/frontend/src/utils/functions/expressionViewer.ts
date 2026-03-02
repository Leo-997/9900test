import { expressionViewerConfig } from '@/constants/expressionViewer';
import { ITPMData, IRNASeqGeneTPMPlot, IGraph } from '@/types/RNAseq.types';

export function createGraphData(
  dbData: ITPMData[],
  selectedRnaSeqId,
  gene,
  selectedSubcat2,
  selectedCategory,
  showCategory,
): IRNASeqGeneTPMPlot {
  const match = dbData.find((obj) => obj.biosampleId === selectedRnaSeqId);
  const {
    publicSubjectId: selectedPublicSubjectId,
    tpm: selectedTPM,
  } = match || {} as ITPMData;

  const sortedData = dbData.sort((a, b) => {
    const getPriority = (item: ITPMData) => {
      if (item.biosampleId === selectedRnaSeqId) return 1;
      if (item.publicSubjectId === selectedPublicSubjectId) return 2;
      if (item.subcat2 === selectedSubcat2) return 3;
      if (item.category === selectedCategory) return 4;
      return 5;
    };
    return getPriority(b) - getPriority(a);
  });

  const data = sortedData.map((item) => {
    let legend: string;
    if (item.biosampleId === selectedRnaSeqId) {
      legend = item.biosampleId;
    } else if (item.publicSubjectId === selectedPublicSubjectId) {
      legend = item.publicSubjectId;
    } else if (item.subcat2 === selectedSubcat2) {
      legend = selectedSubcat2;
    } else if (item.category === selectedCategory && showCategory) {
      legend = selectedCategory;
    } else {
      legend = 'Cohort';
    }
    return { ...item, legend };
  });

  const graph: IGraph = {
    x: {
      patientId: data.map((item) => item.publicSubjectId),
      legend: data.map((item) => item.legend),
      category: data.map((item) => item.category),
      subcat2: data.map((item) => item.subcat2),
      finalDiagnosis: data.map((item) => item.finalDiagnosis),
      gene: Array(data.length).fill(gene),
      event: data.map((item) => item.event),
      zscore: data.map((item) => item.zscore),
    },
    y: {
      data: [data.map((item) => item.tpm)],
      smps: data.map((item) => item.biosampleId),
      vars: ['TPM Values'],
    },
  };

  const samePatient = dbData
    .filter(
      (item) => item.publicSubjectId === selectedPublicSubjectId
        && item.biosampleId !== selectedRnaSeqId,
    ).map((item) => item.biosampleId);

  const graphInfo: IRNASeqGeneTPMPlot = {
    categories: data.map(({ category, subcat2 }) => ({ category, subcat2 })),
    category: selectedCategory,
    geneIds: Array(data.length).fill(gene),
    geneIndex: dbData.findIndex((obj) => obj.biosampleId === selectedRnaSeqId),
    geneName: gene,
    graph,
    matching: samePatient.length,
    matchingSample: samePatient,
    patient: selectedPublicSubjectId,
    sampleTPM: selectedTPM,
    sampleIndex: dbData.findIndex((obj) => obj.biosampleId === selectedRnaSeqId),
    sampleName: selectedRnaSeqId,
    subcat2: selectedSubcat2,
  };
  return graphInfo;
}

export function createConfig(
  graphData: IRNASeqGeneTPMPlot,
  rnaSeqId: string,
) {
  const legendOrderArray = [
    rnaSeqId,
    'Cohort',
    graphData.matchingSample.length > 0 ? graphData.patient : undefined,
    graphData.graph.x.subcat2.includes(graphData.subcat2) ? graphData.subcat2 : undefined,
    graphData.graph.x.category.includes(graphData.category) ? graphData.category : undefined,
  ].filter(Boolean);

  const colourMapping: Record<string, string> = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Cohort: '#000000',
    [rnaSeqId]: '#FF2969',
    [graphData.patient]: '#f9d51a',
    [graphData.subcat2]: '#40E58D',
    [graphData.category]: '#1E86FC',
    default: '#000000',
  };

  const filteredColours = legendOrderArray.map((item) => colourMapping[item || 'default']);

  return {
    ...expressionViewerConfig,
    legendOrder: {
      legend: legendOrderArray,
    },
    colors: filteredColours,
    smpTitle: `${graphData.geneName}`,
    saveFilename: `${rnaSeqId}_${graphData.geneName}.png`,
  };
}
