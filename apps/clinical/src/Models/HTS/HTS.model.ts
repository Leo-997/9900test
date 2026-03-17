export interface IHTSDrug {
  id: string;
  clinicalVersionId: string;
  htsBiosampleId: string;
  screenId: string;
  hit: boolean;
  classification: string;
  reportedAs: string;
  additionalData: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface IHTSDrugCombination {
  id: string;
  clinialVersionId: string;
  htsBiosampleId: string;
  screenId1: string;
  screenId2: string;
  additionalData: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
