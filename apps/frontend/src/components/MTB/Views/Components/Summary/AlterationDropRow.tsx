import {
  TableCell as MuiTableCell,
  styled,
  TableRow,
} from '@mui/material';
import { useDrop } from 'react-dnd';
import { useCallback, type JSX } from 'react';
import { IGeneAltSettings, INonGeneAltSettings } from '@/types/MTB/Settings.types';
import { IMolAltSummaryColumn, IMolecularAlterationDetail } from '../../../../../types/MTB/MolecularAlteration.types';

interface IStyleProps {
  isAnyDragging: boolean;
  isOver: boolean;
}

const TableCell = styled(MuiTableCell)<IStyleProps>(({
  isAnyDragging,
  isOver,
  theme,
}) => {
  let height = '0px';
  let backgroundColor = theme.colours.core.white;

  if (isOver) {
    height = '40px';
    backgroundColor = theme.colours.core.green10;
  } else if (isAnyDragging && !isOver) {
    height = '20px';
    backgroundColor = theme.colours.core.grey10;
  }

  return {
    transition: 'all cubic-bezier(.19,1,.22,1) 0.5s',
    height,
    backgroundColor,
    padding: '0px',
    borderWidth: '0px !important',
    width: '100vw',
  };
});

interface IProps<T extends IGeneAltSettings | INonGeneAltSettings> {
  columnSettings: IMolAltSummaryColumn<T>[];
  itemType: string;
  isAnyDragging: boolean;
  onDrop: (itemDropped: IMolecularAlterationDetail) => void;
}

export default function AlterationDropRow<T extends IGeneAltSettings | INonGeneAltSettings>({
  columnSettings,
  itemType,
  isAnyDragging,
  onDrop,
}: IProps<T>): JSX.Element {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: itemType,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const dropRef = useCallback((node: HTMLTableRowElement | null) => {
    if (node) {
      drop(node);
    }
  }, [drop]);

  return (
    <TableRow>
      <TableCell
        ref={dropRef}
        isOver={isOver}
        isAnyDragging={isAnyDragging}
        colSpan={columnSettings.filter((setting) => setting.visible).length + 2}
      />
    </TableRow>
  );
}
