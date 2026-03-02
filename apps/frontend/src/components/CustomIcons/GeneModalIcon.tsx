import getGeneImportance from "../../utils/functions/getGeneImportance";
import CircleIcon from "./CircleIcon";
import DiamondIcon from "./DiamondIcon";
import HexagonIcon from "./HexagonIcon";
import SquareIcon from "./SquareIcon";

export interface GeneModalIconIntrface {
  pathClass: string; // Pathclass
  prismClass: string; // Prism Class
  height: number;
  width: number;
}

export default function GeneModalIcon(props: GeneModalIconIntrface) {
  const {
    pathClass,
    prismClass,
    height = 60,
    width = 60,
  }: GeneModalIconIntrface = props;

  const { finalImp } = getGeneImportance(pathClass, prismClass);

  switch (finalImp) {
    case 3:
      return <DiamondIcon iconColor="#D0D9E2" height={height} width={width} />;
    case 2:
      return <SquareIcon iconColor="#D0D9E2" height={height} width={width} />;
    case 1:
      return <HexagonIcon iconColor="#D0D9E2" height={height} width={width} />;
    case 0:
      return <CircleIcon iconColor="#D0D9E2" height={height} width={width} />;
    default:
      return <CircleIcon iconColor="#D0D9E2" height={height} width={width} />;
  }
}
