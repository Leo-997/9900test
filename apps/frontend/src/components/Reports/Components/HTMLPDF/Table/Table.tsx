import {
  Box,
  IconButton,
  styled, TableCell,
  Tooltip,
} from '@mui/material';
import {
  ArrowDownIcon, ArrowUpIcon, PencilIcon, RotateCcwIcon,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { enqueueSnackbar } from 'notistack';
import {
  JSX,
  ReactNode, useCallback,
  useEffect,
  useMemo, useRef, useState,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CustomButton from '@/components/Common/Button';
import CustomModal from '@/components/Common/CustomModal';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { corePalette } from '@/themes/colours';
import { IUpdateOrder } from '@/types/Common.types';
import { ReportVariantType } from '@/types/Reports/Reports.types';
import { errorFetchingDataMsg } from '@/constants/Reports/reports';
import { IReportTableCommentOptions, IReportTableRow } from '../../../../../types/Reports/Table.types';
import CustomTypography from '../../../../Common/Typography';
import { InterpretationRow } from '../Comments/MolecularInterpretationRow';
import { ErrorMessageBox } from '../Components/ErrorMessageBox';

interface IStyleProps {
  textSize: 'small' | 'medium' | 'large';
}

const formatTextSize = ((
  textSize: 'small' | 'medium' | 'large',
  small: number,
  medium: number,
  large: number,
): string => {
  let pixels;

  switch (textSize) {
    case 'small':
      pixels = `${small}`;
      break;
    case 'medium':
      pixels = `${medium}`;
      break;
    default:
      pixels = `${large}`;
      break;
  }

  return `${pixels}px !important`;
});

const HeaderRow = styled('tr')<IStyleProps>(({ theme, textSize }) => ({
  borderBottom: `1px solid ${theme.colours.core.grey100}`,

  '& td': {
    height: formatTextSize(textSize, 16, 22, 24),
    padding: '2px 5px',
    borderRight: `1px solid ${theme.colours.core.grey50}`,
    textAlign: 'left',
    whiteSpace: 'nowrap',

    '& > *': {
      fontSize: formatTextSize(textSize, 7, 8, 9),
      lineHeight: '10px',
    },
  },
}));

const Row = styled('tr')<IStyleProps>(({ theme, textSize }) => ({
  borderBottom: `1px solid ${theme.colours.core.grey50}`,
  padding: '0px 2px',
  position: 'relative',

  '& td': {
    padding: '4px 8px',
    borderRight: `1px solid ${theme.colours.core.grey50}`,
    fontSize: formatTextSize(textSize, 7, 9, 13),
    lineHeight: formatTextSize(textSize, 8, 13, 16),
    overflowWrap: 'anywhere',

    '& :not(.MuiSelect-root, .MuiSelect-root *)': {
      fontSize: formatTextSize(textSize, 7, 9, 13),
      lineHeight: formatTextSize(textSize, 8, 13, 16),
    },

    '& .MuiBox-root': {

      '& :not(.MuiSelect-root, .MuiSelect-root *)': {
        fontSize: formatTextSize(textSize, 7, 9, 13),
        lineHeight: formatTextSize(textSize, 8, 13, 16),
      },
    },
  },
}));

const Legend = styled(CustomTypography)<IStyleProps>(({ textSize }) => ({
  position: 'relative',
  top: '4px',
  whiteSpace: 'pre-wrap',
  lineHeight: '0.5rem',

  '& > *': {
    fontSize: `${textSize === 'small' ? '7px' : '10px'} !important`,
    textTransform: 'none',
    fontWeight: 400,
    letterSpacing: '0.25px',
  },
}));

const TableRoot = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
});

interface ITableProps {
  title: string;
  titleAlignment?: 'left' | 'center' | 'right' | 'space-between';
  variantType?: ReportVariantType;
  header?: IReportTableRow[];
  rows: IReportTableRow[];
  noRowsMessage: string;
  legend?: string;
  textSize?: 'small' | 'medium' | 'large';
  canManage?: boolean;
  commentOptions?: IReportTableCommentOptions;
  showErrorMsg?: boolean;
}

interface IOrderingOptions {
  showArrows: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export function Table({
  title,
  titleAlignment = 'space-between',
  variantType,
  header,
  rows: inputRows,
  noRowsMessage: defaultNoRowsMessage,
  legend,
  textSize = 'large',
  canManage = false,
  commentOptions,
  showErrorMsg,
}: ITableProps): JSX.Element {
  const {
    isGeneratingReport,
    reportMetadata,
    updateMetadata,
    pendingReport,
    isApproving,
  } = useReport();

  const [rows, setRows] = useState<IReportTableRow[]>(inputRows);
  const [reorderingRows, setReorderingRows] = useState<IReportTableRow[]>(() => {
    if (reportMetadata?.[`report.result.order.${variantType}`]) {
      try {
        const order: IUpdateOrder[] = JSON.parse(reportMetadata?.[`report.result.order.${variantType}`]);
        return inputRows.sort((a, b) => {
          const aOrder = order.findIndex((o) => o.id === a.entityId);
          const bOrder = order.findIndex((o) => o.id === b.entityId);
          return aOrder - bOrder;
        });
      } catch { /* empty */ }
    }

    return inputRows;
  });
  const [manageModalOpen, setManageModalOpen] = useState<boolean>(false);
  const [isEditingEmpty, setIsEditingEmpty] = useState<boolean>(false);

  const tableRef = useRef<HTMLTableElement | null>(null);

  const getLinkFromPart = useCallback((part: string): ReactNode => {
    // Uses markdown link syntax [text-to-display](link-for-text)
    // We split the text on the regex to seperate in 4 parts:
    // text-before-link, link-text, link, text-after-link
    // Then transform to html syntax
    // text-before-link<a href="link">link-text</a>text-after-link
    const regex = /\[(.*?)\]\((.*?)\)/;
    const splitParts = part.split(regex);
    if (splitParts.length === 4) {
      // valid url syntax
      const [before, linkText, url, after] = splitParts;
      return (
        <>
          {before}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            {linkText}
          </a>
          {after}
        </>
      );
    }
    return part;
  }, []);

  const getCellContent = useCallback((content: string): ReactNode => {
    const lines = content.split('\n');
    return lines.map((line, lineIndex, self) => (
      <>
        {line.split('**').map((part, index) => (
          index % 2 !== 0
            ? <b>{getLinkFromPart(part)}</b>
            : getLinkFromPart(part)
        ))}
        {lineIndex < self.length - 1 && <br />}
      </>
    ));
  }, [getLinkFromPart]);

  const noRowsMessage = useMemo(() => {
    if (commentOptions) {
      if (
        reportMetadata
        && reportMetadata[`report.no.result.message.${commentOptions?.entityType}`]
      ) {
        return reportMetadata[`report.no.result.message.${commentOptions?.entityType}`] as string;
      }
      return renderToStaticMarkup(getCellContent(defaultNoRowsMessage));
    }
    return defaultNoRowsMessage;
  }, [commentOptions, getCellContent, defaultNoRowsMessage, reportMetadata]);

  useEffect(() => {
    if (tableRef.current && showErrorMsg && isApproving === 'Finalise') {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isApproving, showErrorMsg]);

  const handleRowReorder = (row: IReportTableRow, dir: 'up' | 'down'): void => {
    const index = reorderingRows.findIndex((r) => (
      r.entityId === row.entityId
      && r.entityType === row.entityType
    ));
    if (index === -1) return;
    let newArr = [...reorderingRows];
    newArr.splice(index, 1);
    if (dir === 'up') {
      newArr.splice(index - 1, 0, row);
    } else if (dir === 'down') {
      newArr.splice(index + 1, 0, row);
    }

    newArr = newArr.map((s, i) => ({ ...s, index: i }));

    setReorderingRows(newArr);
  };

  const confirmRowReorder = async (): Promise<void> => {
    try {
      updateMetadata({
        ...reportMetadata,
        [`report.result.order.${variantType}`]: JSON.stringify(
          reorderingRows.map((r, i) => ({
            id: r.entityId?.toString(),
            order: i,
          })),
        ),
      });
      setRows(reorderingRows);
      setManageModalOpen(false);
    } catch {
      enqueueSnackbar('Could not update order, please try again.', { variant: 'error' });
    }
  };

  const getRow = (
    row: IReportTableRow,
    orderingOptions?: IOrderingOptions,
  ): ReactNode => (
    <>
      <Row
        textSize={textSize}
        style={{
          borderBottom: !orderingOptions && (row.interpretation || row.noBottomBorder) ? 'none' : undefined,
          position: 'relative',
          ...row.styleOverrides,
        }}
      >
        {row.columns.map((col, colIndex) => (
          <TableCell
            component="td"
            sx={{
              width: orderingOptions ? 'auto' : col.width,
              paddingLeft: colIndex === 0 ? 0 : undefined,
              borderRight: colIndex === row.columns.length - 1 ? 'none !important' : undefined,
              height: orderingOptions ? '40px' : undefined,
              pointerEvents: orderingOptions ? 'none' : undefined,
              ...col.styleOverrides,
            }}
            colSpan={col.colSpan}
            rowSpan={col.rowSpan}
          >
            <CustomTypography variant="bodySmall">
              { typeof col.content === 'string'
                ? getCellContent(col.content)
                : (
                  <span>{col.content}</span>
                )}
            </CustomTypography>
          </TableCell>
        ))}
        {orderingOptions?.showArrows && (
          <Box
            position="absolute"
            right="-80px"
            display="flex"
            gap="8px"
            top="2px"
          >
            <IconButton
              onClick={(): void => handleRowReorder(row, 'down')}
              disabled={orderingOptions.isLast}
            >
              <ArrowDownIcon />
            </IconButton>
            <IconButton
              onClick={(): void => handleRowReorder(row, 'up')}
              disabled={orderingOptions.isFirst}
            >
              <ArrowUpIcon />
            </IconButton>
          </Box>
        )}
      </Row>
      {row.interpretation && row.columns.length > 0 && !orderingOptions && (
        <Row textSize={textSize}>
          <td
            colSpan={row.columns.length}
            style={{ padding: 0, borderRight: 'none' }}
          >
            <InterpretationRow
              text={row.interpretation}
            />
          </td>
        </Row>
      )}
    </>
  );

  const getEmptyRow = (): ReactNode => (
    <Row textSize={textSize}>
      <td colSpan={header?.[0].columns.reduce((prev, curr) => prev + (curr.colSpan || 1), 0)} style={{ border: 'none' }}>
        {commentOptions ? (
          <RichTextEditor
            key={noRowsMessage}
            mode={
              isEditingEmpty && !isGeneratingReport && !commentOptions.disabled
                ? 'manualSave'
                : 'readOnly'
            }
            initialText={noRowsMessage}
            commentMode="readOnly"
            hideComments
            condensed={Boolean(isGeneratingReport)}
            onSave={(newText): void => {
              updateMetadata({
                ...reportMetadata,
                [`report.no.result.message.${commentOptions.entityType}`]: newText,
              });
              setIsEditingEmpty(false);
            }}
            onCancel={(): void => setIsEditingEmpty(false)}
            disablePlugins={[
              'text-bg',
              'text-colour',
              'table',
              'evidence',
            ]}
            disableSaveOnEmpty
          />
        ) : (
          getCellContent(defaultNoRowsMessage)
        )}
      </td>
    </Row>
  );

  const titleNode = (
    <Box
      display="flex"
      justifyContent={titleAlignment}
      paddingBottom="8px"
      ref={tableRef}
    >
      <CustomTypography
        variant="bodyRegular"
        fontWeight="bold"
        style={{
          fontSize: textSize === 'small' ? '11px' : '16px',
        }}
      >
        <b>
          {title}
        </b>
      </CustomTypography>
      {canManage && pendingReport && !isGeneratingReport && rows.length > 1 && (
        <CustomButton
          label="Manage"
          variant="text"
          size="small"
          onClick={(): void => setManageModalOpen(true)}
        />
      )}
      {!isGeneratingReport && rows.length === 0 && commentOptions && (
        <Box display="flex" gap="8px">
          <Tooltip title="Edit comment">
            <IconButton
              onClick={(): void => setIsEditingEmpty(true)}
              disabled={commentOptions.disabled}
            >
              <PencilIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset comment">
            <IconButton
              disabled={commentOptions.disabled}
              onClick={(): void => {
                updateMetadata({
                  ...reportMetadata,
                  [`report.no.result.message.${commentOptions.entityType}`]: undefined,
                });
              }}
            >
              <RotateCcwIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  const headerNode = (
    header?.map((row, rowIndex) => (
      <HeaderRow
        textSize={textSize}
        sx={{
          borderColor: rowIndex !== header.length - 1
            ? corePalette.grey50
            : undefined,
        }}
      >
        { row.columns.map((cell, index) => (
          <TableCell
            component="td"
            sx={{
              width: cell.width,
              paddingLeft: index === 0 ? 0 : undefined,
              borderRight: index === row.columns.length - 1 ? 'none !important' : undefined,
              ...cell.styleOverrides,
            }}
            colSpan={cell.colSpan || 1}
            rowSpan={cell.rowSpan || 1}
          >
            <CustomTypography variant="label">
              <span>{cell.content}</span>
            </CustomTypography>
          </TableCell>
        ))}
      </HeaderRow>
    ))
  );

  const legendNode = legend && (
    <Legend variant="label" textSize={textSize}>
      <span>{legend}</span>
    </Legend>
  );

  if (rows.length === 0) {
    return (
      <div className="keep-together">
        {titleNode}
        {noRowsMessage && (
          <TableRoot>
            {headerNode}
            {getEmptyRow()}
          </TableRoot>
        )}
        {legendNode}
        {showErrorMsg && (
          <ErrorMessageBox
            message={errorFetchingDataMsg}
            sx={{ marginTop: '5px' }}
          />
        ) }
      </div>
    );
  }

  return (
    <>
      <TableRoot>
        <thead className={rows[0].breakable ? undefined : 'keep-together'}>
          <tr>
            {rows[0].columns.map((c) => (
              <th
                style={{
                  width: c.width,
                }}
                colSpan={c.colSpan || 1}
              />
            ))}
          </tr>
        </thead>
        <tbody className={rows[0].breakable ? undefined : 'keep-together'}>
          <tr>
            <td
              style={{ textAlign: 'left' }}
              colSpan={rows[0].columns.reduce((prev, c) => prev + (c.colSpan || 1), 0)}
              width={rows[0].columns[0]?.width}
            >
              {titleNode}
            </td>
          </tr>
          {headerNode}
          {getRow(rows[0])}
        </tbody>
        {rows.slice(1).map((row) => (
          <tbody className={row.breakable ? undefined : 'keep-together'}>
            {getRow(row)}
          </tbody>
        ))}
      </TableRoot>
      {legendNode}
      {showErrorMsg && (
        <ErrorMessageBox
          message={errorFetchingDataMsg}
          sx={{ marginTop: '5px' }}
        />
      )}
      {manageModalOpen && (
        <CustomModal
          title={`${title} - Reorder rows`}
          open={manageModalOpen}
          onClose={(): void => {
            setReorderingRows(rows);
            setManageModalOpen(false);
          }}
          onConfirm={confirmRowReorder}
          content={(
            <Box width="100%" display="flex" justifyContent="flex-start">
              <Box width="calc(100% - 80px)">
                <TableRoot sx={{ tableLayout: 'auto' }}>
                  {headerNode}
                  {
                    reorderingRows
                      .map((r, rowIndex, self) => (
                        <motion.tbody
                          key={`reorder-${title}-${r.entityType}-${r.entityId}`}
                          layout
                          transition={{
                            ease: [0.19, 1, 0.22, 1],
                            duration: 0.4,
                          }}
                        >
                          {
                            getRow(
                              r,
                              {
                                showArrows: Boolean(r.entityType && r.entityId),
                                isFirst: (
                                  rowIndex === 0
                                  || !(self[rowIndex - 1].entityType && self[rowIndex - 1].entityId)
                                ),
                                isLast: (
                                  rowIndex === self.length - 1
                                  || !(self[rowIndex + 1].entityType && self[rowIndex + 1].entityId)
                                ),
                              },
                            )
                          }
                        </motion.tbody>
                      ))
                  }
                </TableRoot>
              </Box>
            </Box>
          )}
        />
      )}
    </>
  );
}
