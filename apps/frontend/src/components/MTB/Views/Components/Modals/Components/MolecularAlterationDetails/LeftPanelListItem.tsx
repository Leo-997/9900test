import { Box } from '@mui/material';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { IMolSelectedRow } from '../../../../../../../types/MTB/MolecularAlteration.types';
import {
  ILeftPanelTableMapper,
  ISampleDetail,
} from '../../../../../../../types/Samples/Sample.types';
import CustomTypography from '../../../../../../Common/Typography';

import type { JSX } from "react";

interface ILeftPanelListItemProps {
  tableColumns: ILeftPanelTableMapper[];
  data: Omit<ISampleDetail, 'additionalData'>;
  onRowClick: (molId: string, groupId: string) => void;
  selectedRow: IMolSelectedRow;
}

const useStyles = makeStyles(() => ({
  root: {
    boxSizing: 'border-box',
    cursor: 'pointer',
    padding: '8px 16px',
    gap: '16px',
    height: '80px',
    borderBottom: '1px solid #ECF0F3',
  },
  bodyText: {
    height: '20px',
    color: '#273957',
  },
  rootSelected: {
    background: '#F3F7FF',
    border: '1px solid #1E86FC',
    borderRadius: '8px',
  },
}));

export function LeftPanelListItem({
  data,
  onRowClick,
  selectedRow,
  tableColumns,
}: ILeftPanelListItemProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="flex-start"
      onClick={(): void => {
        onRowClick(data.molAlterationId, data.groupId);
      }}
      className={clsx(
        classes.root,
        selectedRow.molId === data?.molAlterationId
          && selectedRow.groupId === data?.groupId
          && classes.rootSelected,
      )}
    >
      {tableColumns.map(({ key, displayRender, style }) => (
        <CustomTypography
          key={key}
          style={style}
          truncate
          className={classes.bodyText}
          variant="bodySmall"
        >
          {
            displayRender
              ? displayRender(data[key])
              : data[key] || '-'
          }
        </CustomTypography>
      ))}
    </Box>
  );
}
