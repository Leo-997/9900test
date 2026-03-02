import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import Ideogram from 'ideogram';

const cytoband = (cn : number) => new Ideogram({
  organism: 'human',
  orientation: 'horizontal',
  chromosome: cn,
});

export default function CytobandIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      {cytoband(1)}
    </SvgIcon>
  );
}
