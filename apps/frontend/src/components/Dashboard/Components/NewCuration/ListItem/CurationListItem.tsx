import {
  Box,
  IconButton,
  MenuItem,
  TableCell as MuiTableCell,
  styled,
  TableRow,
  Tooltip,
} from '@mui/material';
import dayjs from 'dayjs';
import { ClockAlertIcon, EllipsisVerticalIcon } from 'lucide-react';
import {
  ReactNode, useEffect, useMemo, useState, type JSX,
} from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '@/components/Chips/StatusChip';
import CustomChip from '@/components/Common/Chip';
import CustomTypography from '@/components/Common/Typography';
import { AvatarWithBadge } from '@/components/CustomIcons/AvatarWithBadge';
import UsersMenu from '@/components/UsersMenu/UsersMenu';
import { pseudoStatusesMap } from '@/constants/Common/status';
import { curationStatuses } from '@/constants/Curation/navigation';
import { useUser } from '@/contexts/UserContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IPipeline } from '@/types/Analysis/Biosamples.types';
import { CuratorType, IUser } from '@/types/Auth/User.types';
import { AvatarStatus } from '@/types/Avatar.types';
import getPrimaryBiosample from '@/utils/functions/biosamples/getPrimaryBiosample';
import mapEvent from '@/utils/functions/mapEvent';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { toFixed } from '@/utils/math/toFixed';
import { CurationSampleMenu } from '../../Curation/ListItem/CurationSampleMenu';

interface IStyleProps {
  type?: 'main' | 'related' | 'readOnly';
}

const DateChip = styled(CustomTypography)(({ theme }) => ({
  color: theme.colours.core.offBlack100,
  border: `2px solid ${theme.colours.core.grey50}`,
  borderRadius: '6px',
  padding: '0 5px',
  fontSize: '13px',
}));

const TableCell = styled(MuiTableCell)<IStyleProps>(({ type, theme }) => ({
  backgroundColor: type !== 'related' ? theme.colours.core.white : theme.colours.core.grey30,
  border: 'none',
  padding: '16px 16px 16px 0px',
}));

const TableCellLeft = styled(TableCell)({
  position: 'sticky',
  left: 0,
  paddingLeft: '16px !important',
});

const TableCellRight = styled(TableCell)({
  position: 'sticky',
  right: 0,
});

interface ICuratorMenuOptions {
  anchorEl: HTMLElement | null;
  curatorType: CuratorType | null;
}

interface IProps {
  analysisSet: IAnalysisSet;
  updateAnalysisSet?: (newSet: IAnalysisSet) => void;
  type?: 'main' | 'related' | 'readOnly';
}

export function CurationListItem({
  analysisSet,
  updateAnalysisSet,
  type = 'main',
}: IProps): JSX.Element {
  const { users } = useUser();
  const zeroDashSdk = useZeroDashSdk();

  const primaryCurator = useMemo<IUser | undefined | null>(() => (
    users.find((u) => u.id === analysisSet.primaryCuratorId)
  ), [analysisSet.primaryCuratorId, users]);
  const secondaryCurator = useMemo<IUser | undefined | null>(() => (
    users.find((u) => u.id === analysisSet.secondaryCuratorId)
  ), [analysisSet.secondaryCuratorId, users]);

  const [pipelines, setPipelines] = useState<IPipeline[]>();
  const [curatorMenuOptions, setCuratorMenuOptions] = useState<ICuratorMenuOptions>({
    anchorEl: null,
    curatorType: null,
  });
  const [sampleMenuAnchor, setSampleMenuAnchor] = useState<HTMLElement | null>(null);

  const isAsetReadOnly = useIsPatientReadOnly({ analysisSetId: analysisSet.analysisSetId });
  const canWrite = useIsUserAuthorised('curation.sample.write');
  const canEdit = canWrite && !isAsetReadOnly;

  const getCurationStatusTag = (): ReactNode => (
    <Box
      display="flex"
      flexDirection="column"
      gap="4px"
    >
      <StatusChip
        {
          ...analysisSet.pseudoStatus
            ? pseudoStatusesMap[analysisSet.pseudoStatus]?.chipProps
            : curationStatuses[analysisSet.curationStatus]?.chipProps
        }
        maxWidth="fit-content"
        maxHeight="22px"
      />
      {pipelines && pipelines.length > 0 && (
        <StatusChip
          {
            ...curationStatuses[analysisSet.curationStatus]?.chipProps
          }
          status={dayjs(pipelines[0].runDate).format('DD/MM/YYYY')}
          maxWidth="fit-content"
          tooltipText={pipelines.map((pipeline) => (
            <Box display="flex" flexDirection="column">
              {`${pipeline.pipelineName}: ${pipeline.taskStatus}`}
            </Box>
          ))}
        />
      )}
    </Box>
  );

  const getSecondaryCurationIcon = (): AvatarStatus | undefined => {
    if (analysisSet.secondaryCurationStatus === 'Not Started') return 'ready';
    if (analysisSet.secondaryCurationStatus === 'In Progress') return 'progress';
    if (analysisSet.secondaryCurationStatus === 'Completed') return 'done';

    return undefined;
  };

  getPrimaryBiosample(analysisSet.biosamples || []);

  const updateCurator = async (
    curator: IUser | null,
  ): Promise<void> => {
    setCuratorMenuOptions({
      anchorEl: null,
      curatorType: null,
    });
    const curatorId = curator === null ? null : curator?.id;
    if (curatorMenuOptions.curatorType) {
      const newData = {
        primaryCuratorId: curatorMenuOptions.curatorType === 'Primary'
          ? curatorId
          : analysisSet.primaryCuratorId,
        secondaryCuratorId: curatorMenuOptions.curatorType === 'Secondary'
          ? curatorId
          : analysisSet.secondaryCuratorId,
        secondaryCurationStatus: curatorMenuOptions.curatorType === 'Secondary'
          ? 'Not Started'
          : analysisSet.secondaryCurationStatus,
      };

      await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
        analysisSet.analysisSetId,
        newData,
      );

      if (updateAnalysisSet) {
        updateAnalysisSet({
          ...analysisSet,
          ...newData,
        });
      }
    }
  };

  useEffect(() => {
    if (
      analysisSet.curationStatus === 'In Pipeline'
      && analysisSet.biosamples?.length
    ) {
      zeroDashSdk.curation.biosamples.getPipelines(
        {
          biosamples: analysisSet.biosamples.map((b) => b.biosampleId),
        },
      )
        .then((resp) => {
          resp.sort((a, b) => dayjs(a.runDate).diff(dayjs(b.runDate)));
          setPipelines(resp);
        });
    } else {
      setPipelines(undefined);
    }
  }, [analysisSet.biosamples, analysisSet.curationStatus, zeroDashSdk.curation.biosamples]);

  const isGermlineOnly = analysisSet.cohort === 'Cohort 13: Germline only';
  const isTSO = getPrimaryBiosample(analysisSet.biosamples || [])?.sampleType === 'panel';

  return (
    <>
      <TableRow>
        <TableCellLeft
          type={type}
          sx={{
            minWidth: '200px',
            width: '200px',
            borderLeft: analysisSet.expedite ? `4px solid ${corePalette.orange100}` : undefined,
          }}
        >
          <Box display="flex" gap="8px">
            {Boolean(analysisSet.expedite) && (
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
              >
                <Tooltip
                  title="This case is expedited"
                  placement="right"
                >
                  {/* Style to account for border and align with patient ID */}
                  <ClockAlertIcon color={corePalette.orange100} style={{ position: 'relative', left: '-4px' }} />
                </Tooltip>
              </Box>
            )}
            <Box display="flex" flexDirection="column" gap="8px">
              <Link to={`/${analysisSet.patientId}/${analysisSet.analysisSetId}/curation`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <CustomTypography variant="bodyRegular" fontWeight="bold">
                  {mapEvent(analysisSet.sequencedEvent, true)}
                </CustomTypography>
              </Link>
              <Box display="flex" gap="8px">
                {isTSO && (
                  <CustomChip
                    label="TSO500"
                    backgroundColour={corePalette.magenta10}
                    colour={corePalette.magenta200}
                  />
                )}
                {isGermlineOnly && (
                  <CustomChip
                    label="Germline Only"
                    backgroundColour={corePalette.orange10}
                    colour={corePalette.orange200}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </TableCellLeft>
        <TableCell type={type} sx={{ minWidth: '160px', width: '160px' }}>
          <CustomTypography variant="bodyRegular">
            {getCurationStatusTag()}
          </CustomTypography>
        </TableCell>
        <TableCell type={type} sx={{ minWidth: '110px', width: '18vw' }}>
          <CustomTypography variant="bodyRegular">
            {getPrimaryBiosample(analysisSet.biosamples || [])?.collectionDate && (
              <DateChip variant="bodyRegular" fontWeight="bold">
                {dayjs(getPrimaryBiosample(analysisSet.biosamples || [])?.collectionDate).format('DD/MM/YYYY')}
              </DateChip>
            )}
          </CustomTypography>
        </TableCell>
        <TableCell type={type} sx={{ minWidth: '80px', width: '13vw' }}>
          <CustomTypography variant="bodyRegular">
            {analysisSet.study}
          </CustomTypography>
        </TableCell>
        <TableCell type={type} sx={{ minWidth: '200px', width: '33vw' }}>
          <CustomTypography variant="bodyRegular">
            {analysisSet.cohort}
          </CustomTypography>
        </TableCell>
        <TableCell type={type} sx={{ minWidth: '200px', width: '33vw' }}>
          <CustomTypography variant="bodyRegular">
            {analysisSet.zero2FinalDiagnosis}
          </CustomTypography>
        </TableCell>
        <TableCell type={type} sx={{ minWidth: '110px', width: '15vw' }}>
          <CustomTypography variant="bodyRegular">
            {
              analysisSet.mutBurdenMb !== undefined && analysisSet.mutBurdenMb !== null
                ? toFixed(analysisSet.mutBurdenMb, 2)
                : '-'
            }
          </CustomTypography>
        </TableCell>
        <TableCell type={type} sx={{ minWidth: '60px', width: '13vw' }}>
          <CustomTypography variant="bodyRegular">
            {
              analysisSet.purity !== undefined && analysisSet.purity !== null
                ? toFixed(analysisSet.purity, 2)
                : '-'
            }
          </CustomTypography>
        </TableCell>
        <TableCellRight type={type} sx={{ minWidth: '200px', paddingLeft: '20px' }}>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" flexDirection="row-reverse">
              <IconButton
                sx={{ padding: 0, position: 'relative', left: '-4px' }}
                onClick={(e): void => {
                  setCuratorMenuOptions({
                    anchorEl: e.currentTarget,
                    curatorType: 'Secondary',
                  });
                }}
                disabled={!canEdit}
              >
                <AvatarWithBadge
                  user={secondaryCurator}
                  badgeText="2"
                  status={getSecondaryCurationIcon()}
                  borderStyle={secondaryCurator ? 'solid' : 'dashed'}
                />
              </IconButton>
              <IconButton
                sx={{ padding: 0 }}
                onClick={(e): void => {
                  setCuratorMenuOptions({
                    anchorEl: e.currentTarget,
                    curatorType: 'Primary',
                  });
                }}
                disabled={!canEdit}
              >
                <AvatarWithBadge
                  user={primaryCurator}
                  badgeText="1"
                  borderStyle={primaryCurator ? 'solid' : 'dashed'}
                />
              </IconButton>
            </Box>
            <IconButton
              sx={{ padding: '6px' }}
              onClick={(e): void => setSampleMenuAnchor(e.currentTarget)}
            >
              <EllipsisVerticalIcon />
            </IconButton>
          </Box>
        </TableCellRight>
      </TableRow>
      <UsersMenu
        anchorEl={curatorMenuOptions.anchorEl}
        onClose={(): void => {
          setCuratorMenuOptions({
            anchorEl: null,
            curatorType: null,
          });
        }}
        handleUserSelect={updateCurator}
        group="Curators"
        customFilterFn={(curator: IUser): boolean => (
          curator.id !== primaryCurator?.id
          && curator.id !== secondaryCurator?.id
        )}
        additionalItems={(
          <MenuItem disabled>
            <CustomTypography variant="bodySmall">
              {
                (curatorMenuOptions.curatorType === 'Primary' && !primaryCurator)
                  || (curatorMenuOptions.curatorType === 'Secondary' && !secondaryCurator)
                  ? 'Assign'
                  : 'Reassign'
              }
              &nbsp;
              {curatorMenuOptions.curatorType}
              &nbsp;Curator
            </CustomTypography>
          </MenuItem>
        )}
      />
      <CurationSampleMenu
        anchorEl={sampleMenuAnchor}
        setAnchorEl={setSampleMenuAnchor}
        data={analysisSet}
        updateAnalysisSet={updateAnalysisSet}
      />
    </>
  );
}
