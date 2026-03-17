import { IGene } from "../Gene.model";

export type AddGeneListBodyDTO = {
  listName: string;
  genes: IGene[];
}