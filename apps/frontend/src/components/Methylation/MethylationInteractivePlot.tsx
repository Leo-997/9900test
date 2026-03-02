import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { IMethGeneTable } from '@/types/Methylation.types';
import {
  Card,
  IconButton,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { useState, type JSX } from 'react';
import { ImageIcon, MaximizeIcon } from 'lucide-react';
import CustomDialog from '../Common/CustomDialog';
import Methyliser from './Methyliser';

const Image = styled('img')(() => ({
  position: 'relative',
  width: '100%',
  borderRadius: 4,
  margin: '-75px 0 0 -40px',
}));

const NoImage = styled('div')(({ theme }) => ({
  position: 'relative',
  height: '100%',
  width: '100%',
  backgroundColor: theme.colours.core.grey10,
  border: `1px solid ${theme.colours.core.grey50}`,
  borderRadius: 4,
}));

const ExpandImageButton = styled(IconButton)(() => ({
  position: 'absolute',
  top: 0,
  right: 0,
  fontSize: 18,
  padding: '5px',
}));

const useStyles = makeStyles(() => ({
  card: {
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: '0px',
  },
  missingImg: {
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
    color: '#5E6871',
    top: '50%',
    left: '50%',
    fontSize: 40,
  },
}));

interface IProps {
  imageUrl: string;
  data: IMethGeneTable[];
  gene: string;
  headerTitle?: string;
  className?: string;
}

export default function MethylationInteractivePlot({
  imageUrl,
  data,
  gene,
  headerTitle,
  className,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { methBiosample } = useAnalysisSet();

  const [plotOpen, setPlotOpen] = useState(false);

  return (
    <>
      <Card elevation={0} className={clsx(classes.card, className)}>
        {imageUrl ? (
          <>
            <Image src={imageUrl} alt="" />
            <ExpandImageButton
              onClick={(): void => setPlotOpen(true)}
            >
              <MaximizeIcon />
            </ExpandImageButton>
          </>
        ) : (
          <NoImage>
            <ImageIcon className={classes.missingImg} />
          </NoImage>
        )}
      </Card>
      {methBiosample?.biosampleId && (
        <CustomDialog
          open={plotOpen}
          onClose={(): void => setPlotOpen(false)}
          title={headerTitle ?? ''}
          content={(
            <Methyliser
              data={data}
              methSampleId={methBiosample?.biosampleId}
              gene={gene}
            />
          )}
        />
      )}
    </>
  );
}
