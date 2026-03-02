import clsx from 'clsx';
import {
  ReactNode, useCallback, useState, type JSX,
} from 'react';

import {
  Box,
  Grid,
  Dialog as MuiDialog,
  DialogContent as MuiDialogContent,
  DialogTitle as MuiDialogTitle,
  styled,
} from '@mui/material';

import { makeStyles } from '@mui/styles';
import { ArrowLeftIcon } from 'lucide-react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';

import { useCuration } from '@/contexts/CurationContext';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useUser } from '@/contexts/UserContext';
import { CommonCurationPanelFooter } from './Common/CurationFooter';
import { ExpandedModalHeader } from './Components/ExpandedModalHeader';

import { IGene, IReportableVariant } from '../../types/Common.types';
import { VariantType } from '../../types/misc.types';

import { CurationThreadTypes, ICurationComment } from '../../types/Comments/CurationComments.types';
import { ReportType } from '../../types/Reports/Reports.types';
import CustomButton from '../Common/Button';
import CurationEvidenceArchive from '../Evidence/Archive/CurationEvidenceArchive';
import { ScrollableSection } from '../ScrollableSection/ScrollableSection';
import { CommentsArchive } from './Comments/CommentsArchive';
import { CurationComments } from './Comments/CurationComments';
import ExpandedModalResourcesTab, {
  IResourceParams,
} from './Components/ExpandedModalResourcesTab';

interface IStyleProps {
  overrideType: 'cyto' | 'hts' | 'meth' | undefined;
}

const Dialog = styled(MuiDialog)(({ fullScreen }) => ({
  '& .MuiDialog-paper': {
    overflowY: 'unset',
    maxHeight: fullScreen ? '100vh' : '95vh',
    height: fullScreen ? '100vh' : '90%',
    maxWidth: fullScreen ? '100vw' : undefined,
    width: fullScreen ? '100vw' : undefined,
    borderRadius: fullScreen ? 0 : 16,
    margin: fullScreen ? 0 : undefined,
  },
}));

const DialogTitle = styled(MuiDialogTitle)(({ theme }) => ({
  height: '90px',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  borderBottom: `2px solid ${theme.colours.core.grey30}`,
  padding: 0,
}));

const DialogContent = styled(MuiDialogContent)(() => ({
  padding: '0px',
  height: '100%',
  maxHeight: '100%',
  overflow: 'hidden',
  margin: 0,
}));

const CurationPanelContent = styled(Box)<IStyleProps>(({ theme, overrideType }) => ({
  background: theme.colours.core.white,
  height: `calc(100% - ${overrideType === 'cyto' ? '250px' : '95px'})`,
  maxHeight: `calc(100% - ${overrideType === 'cyto' ? '250px' : '95px'})`,
  overflowY: 'hidden',
  padding: '16px',
  paddingLeft: '16px',
  paddingRight: '16px',
}));

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    maxHeight: '100%',
    overflowY: 'hidden',
  },
  paper: {
    overflowY: 'unset',
    maxHeight: '95vh',
    height: '90%',
    borderRadius: 16,
  },
  paperFullScreen: {
    overflowY: 'unset',
    maxHeight: '100vh',
    height: '100vh',
    maxWidth: '100vw',
    width: '100vw',
    margin: 0,
    borderRadius: 0,
  },
  closeButton: {
    position: 'absolute',
    right: '-15px',
    top: '-15px',
    width: '40px',
    height: '40px',
    padding: '0px',
    minWidth: '40px',
  },
  closeButtonFullScreen: {
    position: 'absolute',
    right: '10px',
    top: '27px',
    width: '40px',
    height: '40px',
    padding: '0px',
    minWidth: '40px',
  },
  curatorPanelFooter: {
    height: '170px',
    paddingLeft: '16px',
    paddingRight: '8px',
    borderBottomLeftRadius: 16,
  },
  overridePanelFooter: {
    height: '200px',
    paddingLeft: '16px',
    paddingRight: '8px',
    borderBottomLeftRadius: 16,
  },
  dialogContentPanel: {
    height: '100%',
    maxHeight: '100%',
  },
  leftPanelContent: {
    height: '100%',
    maxHeight: '100%',
    overflowY: 'auto',
    margin: '8px',
  },
}));

interface IProps<T extends boolean> {
  variantId: number | string;
  variantType: VariantType;
  biosampleId: string;
  open: boolean;
  handleClose(): void;
  params?: IResourceParams;
  curationDataComponent: ReactNode;
  overrideFooter?: ReactNode;
  overrideType?: 'cyto' | 'hts' | 'meth';
  titleIcon?: ReactNode;
  title?: string | ReactNode;
  titleContent?: string | ReactNode;
  showContentFooter?: T;
  variant?: T extends true ? IReportableVariant : never;
  handleUpdateVariant?: T extends true
    ? (body: Partial<IReportableVariant>, reports?: ReportType[]) => Promise<ReportType[] | void>
    : never;
  hideIncludeInReport?: boolean;
  variantGenes?: IGene[];
  overrideRightPanel?: ReactNode;
}

export function ExpandedModal({
  variantId,
  variantType,
  biosampleId,
  open,
  handleClose,
  title,
  titleContent,
  titleIcon,
  params,
  showContentFooter = true,
  curationDataComponent,
  overrideFooter = undefined,
  overrideType,
  variant,
  handleUpdateVariant,
  hideIncludeInReport,
  variantGenes,
  overrideRightPanel,
}: IProps<boolean>): JSX.Element {
  const classes = useStyles({ overrideType });
  const { isAssignedCurator } = useCuration();
  const { isAssignedClinician } = useReport();
  const { currentUser } = useUser();

  const [expandPanel, setExpandPanel] = useState<ReactNode>(null);
  const [prevCommentsTab, setPrevCommentsTab] = useState<CurationThreadTypes>('CURATION');
  const [isResourceCollapsed, setIsResourceCollapsed] = useState<boolean>(true);
  const [isCommentsCollapsed, setIsCommentsCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const canEditComment = useIsUserAuthorised('curation.sample.write');
  const canEditMolecular = useIsUserAuthorised('report.molecular.write', isAssignedCurator, isAssignedClinician);
  const canEditGermline = useIsUserAuthorised('report.germline.write', isAssignedCurator, isAssignedClinician);
  const canEditCuration = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator);

  // For germline, can only edit if:
  // 1. The comment is not a variant interpretation AND they're the assigned cancer geneticist
  // 2. The comment is a variant interpretation AND they're the assigned curator
  const canEdit = useCallback((comment: ICurationComment, type: CurationThreadTypes): boolean => {
    const scopeMap: Record<Exclude<CurationThreadTypes, 'ANALYSIS'>, boolean> = {
      COMMENT: canEditComment,
      MOLECULAR: canEditMolecular,
      GERMLINE: (canEditGermline && comment.type !== 'VARIANT_INTERPRETATION')
        || (comment.type === 'VARIANT_INTERPRETATION' && canEditCuration),
      CURATION: canEditCuration,
    };

    // They wrote the comment
    // They have the correct role
    // Or this is the reports tab and they are an approver
    return comment.createdBy === currentUser?.id
      || scopeMap[type];
  }, [
    canEditComment,
    canEditCuration,
    canEditGermline,
    canEditMolecular,
    currentUser?.id,
  ]);

  const commentsView = useCallback((size: number): ReactNode => (
    <Grid
      size={size}
      style={{
        display: 'flex',
      }}
      className={classes.dialogContentPanel}
    >
      <CurationComments
        defaultTab={prevCommentsTab}
        variantId={variantId}
        variantType={variantType}
        biosampleId={biosampleId}
        variantGenes={variantGenes}
        handleExpandPanel={(defaultFilters, tab): void => {
          setExpandPanel(
            <CommentsArchive
              variantId={variantId}
              variantType={variantType}
              biosampleId={biosampleId}
              type={tab.value}
              defaultFilters={defaultFilters}
              includeTagQuickFilters={!['CURATION', 'COMMENT'].includes(tab.value)}
            />,
          );
          setPrevCommentsTab(tab.value);
        }}
        handleExpandEvidence={(comment: ICurationComment, tab): void => {
          setExpandPanel(
            <Grid marginTop="8px">
              <CurationEvidenceArchive
                comment={comment}
                canSelectEvidence={canEdit(comment, tab.value)}
              />
            </Grid>,
          );
          setPrevCommentsTab(comment.thread?.type || 'CURATION');
        }}
      />
    </Grid>
  ), [
    classes.dialogContentPanel,
    prevCommentsTab,
    variantId,
    variantType,
    biosampleId,
    variantGenes,
    canEdit,
  ]);

  const resourceView = useCallback((size: number): ReactNode => (
    <Grid
      size={size}
      className={classes.dialogContentPanel}
    >
      <ExpandedModalResourcesTab
        params={params}
        variantType={variantType}
        handleExpandPanel={(): void => setExpandPanel(
          <Grid marginTop="8px">
            <CurationEvidenceArchive
              variantId={variantId}
              variantType={variantType}
              biosampleId={biosampleId}
              canSelectEvidence={canEditCuration}
            />
          </Grid>,
        )}
        varintId={variantId}
      />
    </Grid>
  ), [
    canEditCuration,
    classes.dialogContentPanel,
    params,
    variantId,
    variantType,
    biosampleId,
  ]);

  const getGridSystemValues = useCallback((): ReactNode => {
    if (overrideRightPanel) return overrideRightPanel;
    if (isResourceCollapsed) {
      return commentsView(7);
    } if (isCommentsCollapsed) {
      return resourceView(7);
    }
    return (
      <>
        {commentsView(4)}
        {resourceView(3)}
      </>
    );
  }, [
    commentsView,
    isCommentsCollapsed,
    isResourceCollapsed,
    overrideRightPanel,
    resourceView,
  ]);

  return (
    <Dialog
      open={open}
      disableEnforceFocus
      fullWidth
      onClose={handleClose}
      fullScreen={isFullscreen}
    >
      <DialogTitle>
        <ExpandedModalHeader
          title={title}
          titleContent={titleContent}
          icon={titleIcon}
          expandPanel={expandPanel}
          isFullScreen={isFullscreen}
          onClose={handleClose}
          isCommentsCollapsed={isCommentsCollapsed}
          isResourceCollapsed={isResourceCollapsed}
          onResoucesCollapse={(): void => (
            setIsResourceCollapsed((prev) => {
              if (isCommentsCollapsed && !prev) {
                setIsCommentsCollapsed(false);
              }
              return !prev;
            })
          )}
          onCommentsCollapse={(): void => (
            setIsCommentsCollapsed((prev) => {
              if (isResourceCollapsed && !prev) {
                setIsResourceCollapsed(false);
              }
              return !prev;
            })
          )}
          onFullScreen={(): void => setIsFullscreen((prev) => !prev)}
          hidePanels={Boolean(overrideRightPanel)}
        />
      </DialogTitle>
      <DialogContent>
        <Grid container style={{ height: '100%' }}>
          <Grid
            size={5}
            className={classes.dialogContentPanel}
            style={{ height: '100%' }}
          >
            <CurationPanelContent
              overrideType={overrideType}
              className={clsx({
                [classes.root]: true,
                [classes.leftPanelContent]: !showContentFooter && overrideFooter !== 'hts',
              })}
            >
              <ScrollableSection
                style={{
                  width: '100%',
                  height: '100%',
                  overflowX: 'hidden',
                }}
              >
                {curationDataComponent}
              </ScrollableSection>
            </CurationPanelContent>
            {overrideFooter !== undefined && showContentFooter ? (
              <div className={classes.overridePanelFooter}>
                {overrideFooter}
              </div>
            ) : (
              showContentFooter && variant && handleUpdateVariant && (
                <div className={clsx(classes.curatorPanelFooter)}>
                  <CommonCurationPanelFooter
                    variant={variant}
                    variantId={variantId.toString()}
                    biosampleId={biosampleId}
                    variantType={variantType}
                    handleUpdateVariant={handleUpdateVariant}
                    hideIncludeInReport={hideIncludeInReport}
                  />
                </div>
              )
            )}
          </Grid>
          {expandPanel !== null ? (
            <Grid
              size={7}
              style={{
                paddingLeft: 8,
                paddingRight: 8,
                height: '100%',
              }}
              className={classes.dialogContentPanel}
            >
              <Box
                width="100%"
                height="100%"
                padding="24px"
              >
                <CustomButton
                  variant="text"
                  label="Back"
                  size="small"
                  startIcon={<ArrowLeftIcon />}
                  onClick={(): void => setExpandPanel(null)}
                />
                {expandPanel}
              </Box>
            </Grid>
          ) : (
            getGridSystemValues()
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
