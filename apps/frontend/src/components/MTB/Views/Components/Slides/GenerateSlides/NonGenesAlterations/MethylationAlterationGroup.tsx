import {
  Checkbox,
  TableCell as MuiTableCell,
  TableRow as MuiTableRow,
  styled,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import { IMolAltSelectModalColumn, IMolecularAlterationDetail } from '../../../../../../../types/MTB/MolecularAlteration.types';
import { MolAlterationsSelectModalListItem } from '../MolAlterationsSelectModalListItem';
import CustomTypography from '../../../../../../Common/Typography';

const TableRow = styled(MuiTableRow)(({ theme }) => ({
  height: '56px',
  width: '784px',
  border: 'none',
  borderLeft: `1px solid ${theme.colours.core.turquoise100}`,
  backgroundColor: theme.colours.core.white,
}));

const TableCell = styled(MuiTableCell)({
  padding: 0,
  backgroundColor: 'inherit',
  border: 'none',
});

interface IProps {
  methylationAlterations: IMolecularAlterationDetail[];
  handleOnChangeAlteration: (
    molAlteration: IMolecularAlterationDetail,
  ) => void;
  selectedMolAlterations: IMolecularAlterationDetail[];
  setSelectedMolAlterations: Dispatch<
    SetStateAction<IMolecularAlterationDetail[]>
  >;
  isChecked: (
    molAlteration: IMolecularAlterationDetail
  ) => boolean;
  columnSettings: IMolAltSelectModalColumn[];
}

export function MethylationAlterationGroup({
  methylationAlterations,
  handleOnChangeAlteration,
  setSelectedMolAlterations,
  isChecked,
  columnSettings,
  selectedMolAlterations,
}: IProps): JSX.Element {
  const [mgmtAlteration, ...classifiers] = methylationAlterations || [];
  const [isMGMTPresent, setIsMGMTPresent] = useState<boolean>(false);
  const [isClassifierPresent, setIsClassifierPresent] = useState<boolean>();

  useEffect(() => {
    setIsMGMTPresent(
      selectedMolAlterations.some(
        (item) => item.mutationType === 'METHYLATION_MGMT',
      ),
    );
    setIsClassifierPresent(
      selectedMolAlterations.some(
        (item) => item.mutationType === 'METHYLATION_CLASSIFIER',
      ),
    );
  }, [selectedMolAlterations]);

  const onMethylationGroupSelect = (
    items: IMolecularAlterationDetail[],
    checked: boolean,
  ): void => {
    setSelectedMolAlterations((prev) => {
      if (checked) {
        return [...prev, ...items];
      }
      return [];
    });
  };

  const onClassifierSelect = (
    item: IMolecularAlterationDetail,
  ): void => {
    setSelectedMolAlterations((prev) => {
      if (!isChecked(item)) {
        if (!isMGMTPresent) {
          return [...prev, item, methylationAlterations[0]];
        }
        return [...prev, item];
      }
      if (
        prev.filter(
          (alt) => alt.mutationType === 'METHYLATION_CLASSIFIER',
        ).length === 1
      ) {
        const temp = prev.filter(
          (alt) => alt.mutationType !== 'METHYLATION_MGMT',
        );
        return [...temp.filter((a) => a.id !== item.id)];
      }
      return [...prev.filter((a) => a.id !== item.id)];
    });
  };

  return (
    <>
      <TableRow
        key="methylations"
      >
        <TableCell
          align="center"
        >
          <Checkbox
            {...(selectedMolAlterations.length > 0
              && isMGMTPresent
              && !(methylationAlterations.length === selectedMolAlterations.length)
              ? { indeterminate: true }
              : {})}
            onChange={(e, checked): void => {
              onMethylationGroupSelect(
                methylationAlterations,
                checked,
              );
            }}
            checked={isClassifierPresent || isMGMTPresent}
          />
        </TableCell>
        <TableCell>
          <CustomTypography
            variant="titleRegular"
            fontWeight="bold"
            truncate
          >
            Methylation
          </CustomTypography>
        </TableCell>
      </TableRow>
      {/* Methylations MGMT alteration  */}
      {mgmtAlteration && (
        <MolAlterationsSelectModalListItem
          key={mgmtAlteration.id}
          data={mgmtAlteration}
          handleOnChangeAlteration={handleOnChangeAlteration}
          isDisabled={isClassifierPresent}
          isChecked={isChecked(mgmtAlteration)}
          columnSettings={columnSettings}
        />
      )}
      {/* Methylations classifiers alteration  */}
      {classifiers.map((item) => (
        <MolAlterationsSelectModalListItem
          key={item.id}
          data={item}
          handleOnChangeAlteration={(): void => {
            onClassifierSelect(item);
          }}
          isChecked={isChecked(item)}
          columnSettings={columnSettings}
        />
      ))}
    </>
  );
}
