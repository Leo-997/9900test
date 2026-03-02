import {
  Badge,
  Box,
  Grid,
  IconButton,
  styled,
  Tooltip,
} from '@mui/material';
import { DatabaseIcon, PencilIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import {
  Dispatch, ReactNode, SetStateAction, useEffect, useState, type JSX,
} from 'react';
import { reportOptions } from '@/constants/Reports/reports';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { isClassified } from '@/utils/functions/reportable/isClassified';
import { toFixed } from '@/utils/math/toFixed';
import {
  classificationOptions, cytoCNTypeOptions, yesNoOptions,
} from '../../constants/options';
import { useCuration } from '../../contexts/CurationContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { Chromosome, Classification } from '../../types/Common.types';
import { Arm, ISampleCytoband, IUpdateCytobandBody } from '../../types/Cytogenetics.types';
import { ReportType } from '../../types/Reports/Reports.types';
import { boolToStr, strToBool } from '../../utils/functions/bools';
import { getCytobandFormat } from '../../utils/functions/getCytobandFormat';
import getUpdatedReportableValue from '../../utils/functions/reportable/getUpdatedReportableValue';
import getUpdatedReportsValue from '../../utils/functions/reportable/getUpdatedReportsValue';
import { ScoreChip } from '../Chips/ScoreChip';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

const Row = styled(Grid)(({ theme }) => ({
  padding: '5px 12px 5px 0px',
  borderTop: `1px solid ${theme.colours.core.grey50}`,
}));

const Item = styled(Grid)(() => ({
  width: '100px',
  flexShrink: 0,
  flexGrow: 0,
}));

const CopyNumberItem = styled(Item)(() => ({
  width: '165px',
}));

const StickyItem = styled(Item)(() => ({
  position: 'sticky',
  left: '0px',
  backgroundColor: 'white',
  gap: '8px',
  zIndex: 1,
  alignItems: 'center',
  width: '150px',
  height: '48px',
}));

interface ICytobandListItemProps {
  type: 'somatic' | 'germline';
  biosampleId: string | undefined;
  cytoband: ISampleCytoband;
  cytobands: ISampleCytoband[];
  chromosome: Chromosome;
  setCytobands: Dispatch<SetStateAction<ISampleCytoband[] | undefined>>;
  handleOpenModal(arm: Arm, cyto: ISampleCytoband, reports: ReportType[]): void;
}

export function CytobandListItem({
  type,
  biosampleId,
  cytoband,
  cytobands,
  chromosome,
  setCytobands,
  handleOpenModal,
}: ICytobandListItemProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;
  const { enqueueSnackbar } = useSnackbar();
  const { analysisSet, demographics } = useAnalysisSet();

  const isDefaultCytoband = (): boolean => (Boolean(cytoband.avgCN) || cytoband.avgCN === 0);

  const [selectedReports, setSelectedReports] = useState<ReportType[]>([]);

  const canEdit = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;

  const isSomatic = type === 'somatic';

  useEffect(() => {
    async function getSelectedReports():Promise<void> {
      const reportsData = await zeroDashSdk.reportableVariants.getReportableVariants(
        analysisSet.analysisSetId,
        {
          variantType: [isSomatic ? 'CYTOGENETICS' : 'GERMLINE_CYTO'],
          variantId: cytoband.cytoband,
        },
      );
      const dataReports = reportsData.map((reportData) => reportData.reportType);

      setSelectedReports(dataReports);
    }

    getSelectedReports();
  }, [analysisSet?.analysisSetId, cytoband.cytoband, isSomatic, zeroDashSdk.reportableVariants]);

  const handleUpdateReports = async (newSelectedReports: ReportType[]): Promise<void> => {
    if (biosampleId) {
      try {
        await zeroDashSdk.reportableVariants.updateReportableVariant(
          analysisSet.analysisSetId,
          biosampleId,
          {
            variantType: isSomatic ? 'CYTOGENETICS' : 'GERMLINE_CYTO',
            variantId: cytoband.cytoband,
            reports: newSelectedReports,
          },
        );
        setSelectedReports(newSelectedReports);
      } catch {
        enqueueSnackbar('Cannot update reports data, please try again.', { variant: 'error' });
      }
    }
  };

  const handleUpdate = async (
    body: IUpdateCytobandBody,
    reports?: ReportType[],
  ): Promise<ReportType[]> => {
    if (biosampleId) {
      try {
        const newBody = {
          ...body,
          reportable: getUpdatedReportableValue(
            body,
            cytoband.reportable,
          ),
        };

        if (isSomatic) {
          await zeroDashSdk.cytogenetics.somatic.updateCytoband(
            biosampleId,
            chromosome,
            cytoband.cytoband,
            newBody,
          );
        } else {
          await zeroDashSdk.cytogenetics.germline.updateCytoband(
            biosampleId,
            chromosome,
            cytoband.cytoband,
            newBody,
          );
        }
        setCytobands((prev) => ((prev || []).map((band) => ({
          ...band,
          ...(
            band.cytoband === cytoband.cytoband
              ? newBody
              : {}
          ),
        }))));

        const newReports: ReportType[] = [];
        if (reports) {
          newReports.push(...getUpdatedReportsValue({
            reportable: getUpdatedReportableValue(
              body,
              cytoband.reportable,
            ),
            defaultValue: reports,
            variantType: isSomatic ? undefined : 'GERMLINE_CYTO',
            germlineConsent: demographics,
          }));
        }
        return newReports;
      } catch {
        enqueueSnackbar(
          'Cannot update cytoband data, please try again.',
          { variant: 'error' },
        );
      }
    }
    return [];
  };

  const handleEdit = (): void => {
    handleOpenModal(cytoband.arm as Arm, cytoband, selectedReports);
  };

  return (
    <Row
      container
      size={12}
      key={cytoband.cytoband}
    >
      <Grid container direction="row" alignItems="center" wrap="nowrap" columnGap="8px">
        <StickyItem
          container
          size={3}
          wrap="nowrap"
        >
          <Grid justifyContent="center" flexShrink={0}>
            <IconButton
              onClick={(): void => handleEdit()}
              disabled={isReadOnly || !canEdit}
              sx={{ padding: '8px' }}
            >
              <Badge
                badgeContent={(
                  <DatabaseIcon size={12} />
                )}
                invisible={!isDefaultCytoband()}
                overlap="circular"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <Box display="flex" justifyContent="center">
                  <PencilIcon />
                </Box>
              </Badge>
            </IconButton>
          </Grid>
          <Item>
            <CustomTypography
              variant="bodyRegular"
              tooltipText={!isDefaultCytoband() ? `Custom cytoband: ${cytoband.cytoband}` : cytoband.cytoband}
              fontWeight="bold"
            >
              {getCytobandFormat(cytoband.cytoband)}
            </CustomTypography>
          </Item>
        </StickyItem>
        <Tooltip
          title={
            isDefaultCytoband() && (cytoband.customCn || cytoband.customCn === 0)
              ? `CN: ${cytoband.customCn} | Computed CN: ${cytoband.avgCN}`
              : ''
          }
          placement="top"
        >
          <CopyNumberItem size={2}>
            <ScoreChip
              min={Math.min(2, ...cytobands.map(
                (c) => c.customCn ?? c.avgCN ?? 0,
              ))}
              mid={2}
              max={Math.max(2, ...cytobands.map(
                (c) => c.customCn ?? c.avgCN ?? 2,
              ))}
              value={cytoband.customCn ?? cytoband.avgCN ?? 0}
              label={(isDefaultCytoband() && cytoband.customCn)
                ? `${toFixed(cytoband.customCn, 2)} (${toFixed(cytoband.avgCN ?? 0, 2)})`
                : toFixed(cytoband.customCn ?? cytoband.avgCN ?? 0, 2)}
            />
          </CopyNumberItem>
        </Tooltip>
        <Item
          size={3}
          style={{ width: '125px', maxWidth: '125px' }}
        >
          <AutoWidthSelect
            options={cytoCNTypeOptions}
            sx={{
              maxWidth: '95%',
              minWidth: '95%',
            }}
            value={cytoband.cnType || ''}
            onChange={(e): Promise<ReportType[]> => handleUpdate(
              {
                cnType: e.target.value as string,
              },
            )}
            disabled={isReadOnly || !canEdit}
          />
        </Item>
        <Item
          size={3}
          style={{ width: '125px', maxWidth: '125px' }}
        >
          <CustomTypography variant="bodyRegular">
            <AutoWidthSelect
              options={classificationOptions}
              sx={{
                maxWidth: '95%',
                minWidth: '95%',
              }}
              value={cytoband.classification}
              onChange={async (e): Promise<void> => {
                const newReports = await handleUpdate(
                  {
                    classification: (e.target.value || null) as (Classification | null),
                  },
                  selectedReports,
                );
                handleUpdateReports(newReports);
              }}
              disabled={isReadOnly || !canEdit}
            />
          </CustomTypography>
        </Item>
        <Item size={2}>
          <AutoWidthSelect
            options={yesNoOptions}
            sx={{
              maxWidth: '95%',
              minWidth: '95%',
            }}
            value={boolToStr(cytoband.reportable)}
            onChange={async (e): Promise<void> => {
              const newReports = await handleUpdate(
                {
                  reportable: strToBool(e.target.value as string),
                },
                selectedReports,
              );
              handleUpdateReports(newReports);
            }}
            disabled={
                !isClassified(cytoband)
                || isReadOnly
                || !canEdit
              }
          />
        </Item>
        <Item size={2}>
          <AutoWidthSelect
            multiple
            options={reportOptions}
            sx={{
              maxWidth: '95%',
              minWidth: '95%',
            }}
            value={selectedReports}
            renderValue={(): ReactNode => {
              const reportsAbbreviations = selectedReports
                .map(
                  (report) => reportOptions.find(
                    (option) => option.value === report,
                  )?.abbreviation,
                )
                .sort()
                .join(', ');
              return (
                <CustomTypography truncate>
                  {reportsAbbreviations}
                </CustomTypography>
              );
            }}
            onChange={(e): void => {
              const newReports = e.target.value as ReportType[];
              handleUpdateReports(newReports);
            }}
            disabled={
              !isClassified(cytoband)
              || cytoband.reportable !== true
              || isReadOnly
              || !canEdit
              || (!isSomatic && demographics?.category1Consent === false)
            }
          />
        </Item>
        <Item size={2}>
          <AutoWidthSelect
            options={yesNoOptions}
            sx={{
              maxWidth: '95%',
              minWidth: '95%',
            }}
            value={boolToStr(cytoband.targetable)}
            onChange={(e): void => {
              handleUpdate(
                {
                  targetable: strToBool(e.target.value as string),
                },
              );
            }}
            disabled={isReadOnly || !canEdit}
          />
        </Item>
      </Grid>
    </Row>
  );
}
