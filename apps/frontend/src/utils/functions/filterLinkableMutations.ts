
export const filterLinkableMutations = (mutationType: string): string[] => {
  if (mutationType.startsWith("GERMLINE")) {
    return ["RNA_SEQ", "CNV", "SNV", "SV"];
  } else if (mutationType === "RNA_SEQ" || "CNV" || "SNV" || "SV") {
    return ["GERMLINE_CNV", "GERMLINE_SNV"];
  }
  return [];
};
