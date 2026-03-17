import { IconButton, ListItemAvatar, ListItemSecondaryAction } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { createStyles, makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { EllipsisVerticalIcon, ImageIcon } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { LinxPlot } from '../../../types/Plot.types';
import CustomTypography from '../../Common/Typography';
import { ListItemMenu } from './ListItemMenu';

const useStyles = makeStyles(() => createStyles({
  list: {
    paddingTop: 30,
    paddingBottom: 30,
    width: '100%',
    minHeight: '92px',
    cursor: 'pointer',
  },
  divider: {
    border: '1px dashed #D0D9E2',
    opacity: '0.24',
    width: '100%',
  },
}));

interface IListItemProps {
  plot: LinxPlot;
  setCurrentPlot: (plot: string) => void;
  handleDeletePlot: (plot: LinxPlot) => void;
}

function LinxListItem({
  plot,
  setCurrentPlot,
  handleDeletePlot,
}: IListItemProps): ReactElement<any> {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = async (): Promise<void> => {
    const url = await zeroDashSdk.filetracker.downloadFile(plot.fileId);
    setCurrentPlot(URL.createObjectURL(url));
  };

  const getTitle = (linxPlot: LinxPlot): string => {
    const geneString = linxPlot.genes && linxPlot.genes.length > 0
      ? ` | Gene(s): ${linxPlot.genes.join(', ')}`
      : '';
    if (linxPlot.clusterIds && linxPlot.clusterIds.length > 0) {
      return `Cluster ID(s): ${linxPlot.clusterIds.join(', ')}${geneString}`;
    } if (linxPlot.chr) {
      return `Chromosome: ${linxPlot.chr}${geneString}`;
    }
    return `Gene(s): ${linxPlot.genes}`;
  };

  return (
    <>
      <Box display="flex" flexDirection="column" flex={1}>
        <ListItem
          className={classes.list}
          onClick={handleClick}
        >
          <ListItemAvatar>
            <ImageIcon />
          </ListItemAvatar>
          <Box display="flex" flexDirection="column" style={{ overflow: 'hidden', maxWidth: '550px' }}>
            <ListItemText>
              <CustomTypography truncate variant="bodyRegular" fontWeight="bold">
                {getTitle(plot)}
              </CustomTypography>
            </ListItemText>
            <ListItemText>
              <CustomTypography
                variant="bodySmall"
                truncate
                style={{
                  color: '#62728C',
                }}
              >
                {dayjs(plot.created).format('DD MMM, YYYY [at] h:mm a')}
              </CustomTypography>
            </ListItemText>
          </Box>
          <ListItemSecondaryAction>
            <IconButton
              edge="start"
              onClick={(e): void => setMenuAnchorEl(e.currentTarget)}
            >
              <EllipsisVerticalIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <Divider className={classes.divider} />
      </Box>
      <ListItemMenu
        anchorEl={menuAnchorEl}
        handleClose={(): void => setMenuAnchorEl(null)}
        plot={plot}
        deletePlot={handleDeletePlot}
      />
    </>
  );
}

export default LinxListItem;
