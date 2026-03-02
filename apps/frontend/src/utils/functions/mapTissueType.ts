const tissueTypeMap: Record<string, string> = {
  "BAL": "Bronchoalveolar lavage",
  "BM": "Bone Marrow",
  "BM-SCT": "Bone Marrow post SCT",
  "BMA": "Bone Marrow Aspirate",
  "BMT": "Bone Marrow Trephine",
  "BR": "Brain",
  "BS": "Buccal Swab",
  "BSW": "Bone Marrow Stored Whole",
  "CB": "Cord Blood",
  "CL": "Cell Line",
  "CSF": "Cerebral Spinal Fluid",
  "DNA": "DNA",
  "HF": "Hair Follicle",
  "NPA": "Nasopharyngeal Aspirate",
  "NT": "Normal Tissue",
  "PB-SCT": "Peripheral Blood post SCT",
  "PB": "Peripheral Blood",
  "PCC": "Primary Cell Culture",
  "PEF": "Pericardial Fluid",
  "PF": "Pleural Fluid",
  "RNA": "RNA",
  "SAL": "Saliva",
  "SK": "Skin",
  "Solid": "Solid Tissue",
  "SPB": "Skin Punch Biopsy",
  "STL": "Stool",
  "SW": "Swab",
  "TI": "Tissue",
  "TT": "Tumour Tissue",
  "UN": "Unknown",
  "UR": "Urine",
  "VH": "Vitreous Humor",
  "PDX": "Patient derived xenograft",
  "HTS": "High throughput screening",
  "MNC": "Mono nuclear cells",
};

export function mapTissueType(tissueType: string): string {
  return tissueTypeMap[tissueType]
    ? tissueTypeMap[tissueType]
    : tissueType;
}