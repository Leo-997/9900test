interface IHasGene {
  gene: string;
}

interface IHasTwoGenes {
  startGene: IHasGene;
  endGene: IHasGene;
}

export default function sortByGene(a: IHasGene, b: IHasGene): number {
  return a.gene.toLowerCase().localeCompare(b.gene.toLowerCase());
}

export function sortSvByGene(a: IHasTwoGenes, b: IHasTwoGenes): number {
  const startGeneDiff = sortByGene(a.startGene, b.startGene);
  const endGeneDiff = sortByGene(a.endGene, b.endGene);

  if (startGeneDiff === 0) return endGeneDiff;
  return startGeneDiff;
}
