// @ts-ignore
import genericSearch from "./search.ts";
import { IPathwaysClient } from "../sdk/clients/curation/pathways";

const searchAllPathways = (sample_id: string, setPathways: any, getAllPathwaysFn: IPathwaysClient['getAllPathways']) => (
  query: string
) => {
  // Transform json into component friendly format
  const pathwayFormat = (pathway: any) => {
    pathway.id = pathway.pathwayId;
    pathway.psize = pathway.pSize;
    pathway.pnde = pathway.pNde;
    delete pathway["pathwayId"];
    delete pathway["pSize"];
    delete pathway["pNde"];
    return { pathway: pathway };
  };

  let name = query;
  if (!query) {
    name = "";
  }

  // Update list
  getAllPathwaysFn(sample_id)
    .then((pathways) =>
      pathways.filter((pathway) => genericSearch(pathway, ["name"], name))
    )
    .then((pathways) => pathways.map((p) => pathwayFormat(p)))
    .then((pathways) => {
      setPathways(pathways);
    })
    .catch((error) => {
      console.error(error);
      setPathways([]);
    });
};

export default searchAllPathways;
