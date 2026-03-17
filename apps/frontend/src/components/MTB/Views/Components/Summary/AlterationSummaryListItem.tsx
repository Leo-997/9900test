import {
  Box,
  IconButton,
  lighten,
  Menu,
  MenuItem,
  TableCell as MuiTableCell,
  TableRow as MuiTableRow,
  styled,
  Tooltip,
} from '@mui/material';
import { EllipsisVerticalIcon, EyeOffIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import {
  Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useState, type JSX,
} from 'react';
import { useDrag } from 'react-dnd';
import { corePalette } from '@/themes/colours';
import { useClinical } from '@/contexts/ClinicalContext';
import { getClinicalSVGenes } from '@/utils/functions/getSVGenes';
import { DisruptedTypes, SvType } from '@/types/SV.types';
import { nonGeneAlterationTypes } from '../../../../../constants/alterations';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { IMolAltSummaryColumn, IMolecularAlterationDetail } from '../../../../../types/MTB/MolecularAlteration.types';
import { IGeneAltSettings, INonGeneAltSettings } from '../../../../../types/MTB/Settings.types';
import { VariantType } from '../../../../../types/misc.types';
import { getColourByMutationType } from '../../../../../utils/functions/getColourByMutationType';
import mapMutationType from '../../../../../utils/functions/mapMutationType';
import StatusChip from '../../../../Chips/StatusChip';
import CustomTypography from '../../../../Common/Typography';
import EditModal from './AlterationSummaryEditModal';

interface IStyleProps {
  colour?: string;
  isGermline?: boolean;
  isDragging?: boolean;
  isPresentationMode?: boolean;
  canEdit?: boolean;
}

const TableRow = styled(MuiTableRow)<IStyleProps>(({
  isGermline,
  isDragging,
  isPresentationMode,
  canEdit,
  theme,
}) => {
  let backgroundColor = theme.colours.core.white;
  let cursor = 'default';

  if (isGermline) backgroundColor = lighten(theme.colours.core.orange10, 0.7);

  if (isDragging) cursor = 'grabbing';

  if (!isDragging && canEdit && !isPresentationMode) cursor = 'grab';

  return {
    cursor,
    backgroundColor,
    ...(canEdit && !isPresentationMode && {
      '&:hover': {
        '& #hide-row-button': {
          visibility: 'visible',
          opacity: 1,
        },
      },
    }),
  };
});

const TableCell = styled(MuiTableCell)({
  height: '100%',
  padding: '0.6% 1.5% 0.6% 1.5%',
  backgroundColor: 'inherit',
  border: 'none',
  whiteSpace: 'pre-wrap',
});

const TableCellLeft = styled(TableCell)<IStyleProps>(({ colour }) => ({
  position: 'sticky',
  left: 0,
  width: '54px',
  minWidth: '54px',
  padding: '0px',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '1px',
    backgroundColor: colour,
  },
}));

const TableCellRight = styled(TableCell)({
  position: 'sticky',
  right: 0,
});

interface IProps<T = IGeneAltSettings | INonGeneAltSettings> {
  itemType: string;
  data: IMolecularAlterationDetail;
  summarySettingMapper: IMolAltSummaryColumn<T>[];
  onDataChange: () => void;
  setIsAnyDragging: Dispatch<SetStateAction<boolean>>;
  isPresentationMode?: boolean;
  canEdit?: boolean;
  isForNonGeneType?: boolean;
}

export function AlterationSummaryListItem<T = IGeneAltSettings | INonGeneAltSettings>({
  itemType,
  data,
  summarySettingMapper,
  onDataChange,
  setIsAnyDragging,
  isPresentationMode,
  canEdit,
  isForNonGeneType,
}: IProps<T>): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { clinicalVersion } = useClinical();

  const [editMenu, setEditMenu] = useState<HTMLElement | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [settingManageModal, setSettingManageModal] = useState<IMolAltSummaryColumn<T>[]>(
    summarySettingMapper,
  );

  const [{ isDragging }, drag] = useDrag(() => ({
    type: itemType,
    item: data,
    canDrag: canEdit && !isPresentationMode,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [data?.id, isPresentationMode, canEdit]);

  const dragRef = useCallback((node: HTMLTableRowElement | null) => {
    if (node) {
      drag(node); // attach DnD once the DOM node exists
    }
  }, [drag]);

  const getRowItemContent = (item: IMolAltSummaryColumn<T>, index: number): ReactNode => {
    let content = data[item.key];

    if (data.mutationType.includes('CYTO')) {
      if (item.key === 'gene') {
        content = data.alteration;
      } else if (item.key === 'clinicalAlteration') {
        content = data.description;
      }
    }

    if (data.mutationType.includes('SV') && data.additionalData && item.key === 'gene') {
      content = getClinicalSVGenes({
        startGene: data.additionalData.startGene.toString(),
        endGene: data.additionalData.endGene.toString(),
        markDisrupted: data.additionalData.markDisrupted as DisruptedTypes,
        svType: data.additionalData.svType as SvType,
      });
    }

    if (item.displayTransform) {
      content = item.displayTransform(content, data);
    }

    if (index === 0) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
        >
          {(
            nonGeneAlterationTypes.includes(data.mutationType)
            || data.mutationType.includes('GERMLINE')
          ) && !data.mutationType.includes('METHYLATION')
          && (
            <CustomTypography
              variant="label"
              color={getColourByMutationType(data.mutationType)}
              fontSize="12px"
              fontWeight="normal"
              textTransform="none"
              letterSpacing="normal"
            >
              {mapMutationType(data.mutationType)}
            </CustomTypography>
          )}
          <CustomTypography
            variant="bodyRegular"
          >
            {content}
          </CustomTypography>
        </Box>
      );
    }

    if (item.key === 'clinicalTargetable') {
      return (
        <StatusChip
          status={content ? 'Yes' : 'No'}
          backgroundColor={content ? '#C9FFE2' : '#FEE0E9'}
          color={content ? '#048057' : '#B00047'}
          size="small"
        />
      );
    }

    return (
      <CustomTypography
        variant="bodySmall"
      >
        {item.key === 'mutationType' ? mapMutationType(content as VariantType) : content}
      </CustomTypography>
    );
  };

  const handleClose = (): void => {
    setModalOpen(false);
    setEditMenu(null);
  };

  const updateHidden = async (): Promise<void> => {
    try {
      await zeroDashSdk.mtb.molAlteration.updateMolAlteration(
        clinicalVersion.id,
        { hidden: !data.hidden },
        data.id,
      );
      onDataChange();
    } catch {
      enqueueSnackbar('Unable to update hidden status, please try again.', { variant: 'error' });
    }
  };

  useEffect(() => {
    setSettingManageModal(
      summarySettingMapper.filter((item) => item.visible === true),
    );
  }, [summarySettingMapper]);

  useEffect(() => {
    setIsAnyDragging(isDragging);
  }, [isDragging, setIsAnyDragging]);

  return (
    <TableRow
      ref={dragRef}
      isGermline={data.mutationType.includes('GERMLINE')}
      isDragging={isDragging}
      isPresentationMode={isPresentationMode}
      canEdit={canEdit}
      sx={{ borderBottom: `1px solid ${corePalette.grey30}` }}
    >
      {!isPresentationMode && (
        <TableCellLeft
          align="center"
          colour={getColourByMutationType(data.mutationType)}
        >
          <Tooltip
            title={`${data.hidden ? 'Display' : 'Hide'} row in presentation mode`}
            placement="top"
          >
            <IconButton
              id="hide-row-button"
              onClick={(): void => { updateHidden(); }}
              sx={{
                color: corePalette.grey200,
                left: '8px',
                opacity: data.hidden ? 1 : 0,
                visibility: data.hidden ? 'visible' : 'hidden',
                transition: 'all 0.5s cubic-bezier(.19,1,.22,1)',
              }}
            >
              <EyeOffIcon />
            </IconButton>
          </Tooltip>
        </TableCellLeft>
      )}
      {settingManageModal.map((o, i) => (
        o.visible && (
          <TableCell
            key={o.key}
            sx={{
              ...(i === 0 && {
                position: 'sticky',
                left: isPresentationMode ? 0 : '54px',
              }),
            }}
          >
            {getRowItemContent(o, i)}
          </TableCell>
        )))}
      <TableCellRight align="center">
        {!isPresentationMode && (
          <IconButton
            onClick={(e): void => setEditMenu(e.currentTarget)}
          >
            <EllipsisVerticalIcon />
          </IconButton>
        )}
      </TableCellRight>
      <Menu
        id="edit-menu"
        anchorEl={editMenu}
        open={Boolean(editMenu)}
        onClose={(): void => setEditMenu(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        variant="menu"
      >
        <MenuItem
          onClick={(): void => setModalOpen(true)}
          disabled={!canEdit}
        >
          Edit
        </MenuItem>
      </Menu>
      {modalOpen && (
        <EditModal
          open={modalOpen}
          closeModal={handleClose}
          molAlterationId={data?.id}
          onDataChange={onDataChange}
          isForNonGeneType={isForNonGeneType}
        />
      )}
    </TableRow>
  );
}
