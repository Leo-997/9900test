export type BedFileLine = {
  chr: string;
  pos1: string;
  pos2: string;
};

export function createBedFile(bedContent: BedFileLine[]): Buffer {
  let str = '';
  bedContent.forEach(({ chr, pos1, pos2 }, index) => {
    let line = `chr${chr} ${pos1} ${pos2} chr${chr} 960 + ${pos1} ${pos2}`;
    if (index < bedContent.length - 1) {
      line += '\n';
    }
    str += line;
  });
  return Buffer.from(str);
}
