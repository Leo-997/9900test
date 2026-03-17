import { IFileTrackerSearchOptions } from "../../types/Search.types";

export function createURLQuery(toggled: IFileTrackerSearchOptions) {
  const params = new URLSearchParams("");

  if (toggled.searchId.length > 0) params.set("searchId", toggled.searchId.join(";"));
  if (toggled.fileSize.min > 0) params.set("minFileSize", toggled.fileSize.min.toString());
  if (toggled.fileSize.max < Infinity) params.set("maxFileSize", toggled.fileSize.max.toString());

  ["fileType", "sampleType", "refGenome", "platform"].forEach(key => {
    if (toggled[key].length > 0) params.set(key, toggled[key].join(","));
  });

  return params.toString();
}