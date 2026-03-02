export default function getVarsomPath(
  hgvs = "",
  annotationMode: "somatic" | "germline" = "somatic"
) {
  const matches = hgvs.match(
    /(.+\((.*)\)):(c\.[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+)\s?(\((p\.(.[\w\-!$%^&*()_+|~=`{}[\]:";'<>?,./]+))\))?/
  );

  if (matches) {
    const gene = matches[2];
    const hgvsp = matches[6];

    return `/variant/hg38/${gene}%20${hgvsp}?annotation-mode=${annotationMode}`;
  }
  return "";
}
