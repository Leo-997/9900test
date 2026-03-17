import { AutoWidthSelect } from '@/components/Input/Select/AutoWidthSelect';
import { yesNoOptions } from '@/constants/options';
import { therapyAvailabilityWidths } from '@/constants/Reports/tableWidths';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import {
    ICreateReportDrug, IDetailedReportDrug, IExternalDrug, IReportDrug, IUpdateReportDrug,
} from '@/types/Drugs/Drugs.types';
import { IReportTableRow } from '@/types/Reports/Table.types';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import { Box, IconButton } from '@mui/material';
import {
    PlusIcon,
    Trash2Icon,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState, type JSX } from 'react';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { useReport } from '../../../../../contexts/Reports/CurrentReportContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import CustomButton from '../../../../Common/Button';
import AddTherapyAvailabilityDrug from '../Components/AddTherapyAvailabilityDrug';
import { Table } from '../Table/Table';

interface IProps {
  canEdit?: boolean;
}

export function TherapyAvailablity({
  canEdit,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const {
    clinicalVersion,
  } = useClinical();
  const {
    isGeneratingReport,
    demographics,
    reportType,
    updateMetadata,
    reportMetadata,
  } = useReport();
  const { enqueueSnackbar } = useSnackbar();
  const { recommendations } = useReportData();

  const [reportDrugs, setReportDrugs] = useState<IDetailedReportDrug[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const fetchReportDrugs = useCallback(async () => {
    const detailedDrugs = await zeroDashSdk.mtb.drugs.getDetailedReportDrugs(
      clinicalVersion.id,
      { reportType },
    );
    setReportDrugs(detailedDrugs);
  }, [clinicalVersion.id, reportType, zeroDashSdk.mtb.drugs]);

  const handleDrugUpdate = useCallback(async (
    drug: IReportDrug,
    body: IUpdateReportDrug,
  ) => {
    await zeroDashSdk.mtb.drugs.updateReportDrug(clinicalVersion.id, drug.id, body);
    setReportDrugs((prev) => prev.map((d) => ({
      ...d,
      ...(
        d.id === drug.id
          ? { ...body }
          : {}
      ),
    })));
  }, [clinicalVersion.id, zeroDashSdk.mtb.drugs]);

  const handleDeleteDrug = useCallback(async (drug: IReportDrug) => {
    try {
      const drugOrder = JSON.parse(reportMetadata?.['report.result.order.DRUG_AVAILABILITY'] ?? '[]');
      await updateMetadata({
        ...reportMetadata,
        'report.result.order.DRUG_AVAILABILITY': JSON.stringify(
          drugOrder
            .filter(({ id }) => id !== drug.id)
            .map((d, i) => ({ id: d.id, order: i })),
        ),
      });
      await zeroDashSdk.mtb.drugs.deleteReportDrug(clinicalVersion.id, drug.id);
      setReportDrugs((prev) => prev.filter((d) => d.id !== drug.id));
    } catch {
      enqueueSnackbar('Could not delete drug, please try again', { variant: 'error' });
    }
  }, [clinicalVersion.id, enqueueSnackbar, reportMetadata, updateMetadata, zeroDashSdk.mtb.drugs]);

  const handleAddDrug = useCallback(async (drug: IExternalDrug) => {
    try {
      const newClinicalDrug: ICreateReportDrug = {
        externalDrugVersionId: drug.versionId,
        reportType,
      };
      const id = await zeroDashSdk.mtb.drugs
        .createReportDrug(
          clinicalVersion.id,
          { ...newClinicalDrug, pbsApproved: false, appropriateTrial: false },
        );
      const newTherapyAvailabilityDrug: IDetailedReportDrug = {
        ...newClinicalDrug,
        pbsApproved: false,
        appropriateTrial: false,
        clinicalVersionId: clinicalVersion.id,
        id,
        externalDrug: { ...drug },
      };
      const drugOrder = JSON.parse(reportMetadata?.['report.result.order.DRUG_AVAILABILITY'] ?? '[]');
      await updateMetadata({
        ...reportMetadata,
        'report.result.order.DRUG_AVAILABILITY': JSON.stringify(
          [
            ...drugOrder,
            {
              id: newTherapyAvailabilityDrug.id,
              order: drugOrder.length,
            },
          ],
        ),
      });
      setReportDrugs((prev) => [...prev, newTherapyAvailabilityDrug]);
      setOpenModal(false);
    } catch {
      enqueueSnackbar('Could not add drug, please try again', { variant: 'error' });
    }
  }, [
    clinicalVersion.id,
    enqueueSnackbar,
    reportMetadata,
    reportType,
    updateMetadata,
    zeroDashSdk.mtb.drugs,
  ]);

  const getRows = useCallback(() => (
    reportDrugs
      .map<IReportTableRow>((d) => ({
        columns: [
          {
            content: d.externalDrug.name,
            width: therapyAvailabilityWidths[0],
          },
          {
            content: d.externalDrug.company || '-',
            width: therapyAvailabilityWidths[1],
          },
          {
            content: boolToStr(d.externalDrug.artgApproved) || '-',
            width: therapyAvailabilityWidths[2],
          },
          {
            content: !isGeneratingReport
              ? (
                <AutoWidthSelect
                  options={yesNoOptions}
                  defaultValue={boolToStr(d.pbsApproved)}
                  onChange={(e): Promise<void> => handleDrugUpdate(
                    d,
                    { pbsApproved: strToBool(e.target.value as string) },
                  )}
                  overrideReadonlyMode={!canEdit}
                />
              ) : (
                boolToStr(d.pbsApproved) || '-'
              ),
            width: therapyAvailabilityWidths[3],
          },
          {
            content: demographics?.age !== undefined && demographics.age > 18
              ? 'N/A'
              : boolToStr(d.externalDrug.hasPaediatricDose) || '-',
            width: therapyAvailabilityWidths[4],
          },
          {
            content: !isGeneratingReport
              ? (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <span>
                    <AutoWidthSelect
                      options={yesNoOptions}
                      defaultValue={boolToStr(d.appropriateTrial)}
                      onChange={(e): Promise<void> => handleDrugUpdate(
                        d,
                        { appropriateTrial: strToBool(e.target.value as string) },
                      )}
                      overrideReadonlyMode={!canEdit}
                    />
                  </span>
                  <IconButton
                    onClick={(): Promise<void> => handleDeleteDrug(d)}
                    style={{ padding: '6px' }}
                    disabled={!canEdit}
                  >
                    <Trash2Icon />
                  </IconButton>
                </Box>
              ) : (
                boolToStr(d.appropriateTrial) || '-'
              ),
            width: therapyAvailabilityWidths[5],
          },
        ],
        entityType: 'DRUG_AVAILABILITY',
        entityId: d.id,
      }))
  ), [
    canEdit,
    demographics?.age,
    handleDeleteDrug,
    handleDrugUpdate,
    isGeneratingReport,
    reportDrugs,
  ]);

  useEffect(() => {
    fetchReportDrugs();
  }, [fetchReportDrugs, recommendations]);

  return (
    <>
      {(!isGeneratingReport || reportDrugs.length) ? (
        <Table
          key={`${JSON.stringify(reportDrugs)}-${isGeneratingReport}-${canEdit}`}
          title="Therapy availability in Australia"
          header={reportDrugs.length > 0 ? [
            {
              columns: [
                {
                  content: 'Drug',
                  width: therapyAvailabilityWidths[0],
                },
                {
                  content: 'Company',
                  width: therapyAvailabilityWidths[1],
                },
                {
                  content: 'ARTG',
                  width: therapyAvailabilityWidths[2],
                },
                {
                  content: 'PBS',
                  width: therapyAvailabilityWidths[3],
                },
                {
                  content: 'Paediatric dose',
                  width: therapyAvailabilityWidths[4],
                },
                {
                  content: 'Appropriate clinical trial in Australia',
                  width: therapyAvailabilityWidths[5],
                },
              ],
            },
          ] : undefined}
          rows={getRows()}
          noRowsMessage=""
          canManage
          variantType="DRUG_AVAILABILITY"
        />
      ) : <div />}
      {!isGeneratingReport && (
        <Box marginTop="8px">
          <CustomButton
            variant="text"
            label="Add drug"
            startIcon={<PlusIcon />}
            size="small"
            onClick={(): void => setOpenModal(true)}
            disabled={!canEdit}
          />
          {openModal && (
            <AddTherapyAvailabilityDrug
              open={openModal}
              onClose={(): void => setOpenModal(false)}
              selectedDrugs={
                [...reportDrugs]
                  .map((d) => d.externalDrugVersionId)
              }
              onSubmit={handleAddDrug}
            />
          )}
        </Box>
      )}
    </>
  );
}
