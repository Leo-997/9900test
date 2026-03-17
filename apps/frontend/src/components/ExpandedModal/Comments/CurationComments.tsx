import { CustomTabs } from '@/components/Common/Tabs';
import { IGene } from '@/types/Common.types';
import { Grid, styled } from '@mui/material';
import { useState, type JSX } from 'react';
import { curationCommentTabs } from '../../../constants/Curation/comments';
import { CurationThreadTypes, ICurationComment, ICurationCommentsQuery } from '../../../types/Comments/CurationComments.types';
import { ISelectOption, VariantType } from '../../../types/misc.types';
import { CommentsTab } from './CommentsTab';

const MainContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  borderLeft: `2px solid ${theme.colours.core.grey30}`,
}));

interface IProps {
  defaultTab: CurationThreadTypes;
  variantId: number | string;
  variantType: VariantType;
  biosampleId: string;
  handleExpandPanel: (
    defaultFilters: ICurationCommentsQuery,
    tab: ISelectOption<CurationThreadTypes>,
  ) => void;
  handleExpandEvidence?: (
    comment: ICurationComment,
    tab: ISelectOption<CurationThreadTypes>,
  ) => void;
  variantGenes?: IGene[];
}

export function CurationComments({
  defaultTab,
  variantId,
  variantType,
  biosampleId,
  handleExpandPanel,
  handleExpandEvidence,
  variantGenes,
}: IProps): JSX.Element {
  const [tab, setTab] = useState<CurationThreadTypes>(defaultTab);

  return (
    <MainContainer container flexDirection="column" flexWrap="nowrap">
      <CustomTabs
        fullWidth
        variant="sub-navigation"
        sx={{ width: '100%' }}
        value={tab}
        onChange={(e, value): void => setTab(value)}
        tabs={curationCommentTabs.map((t) => ({ label: t.name, value: t.value }))}
      />
      <CommentsTab
        variantId={variantId}
        variantType={variantType}
        biosampleId={biosampleId}
        variantGenes={variantGenes}
        type={
          curationCommentTabs.find((t) => t.value === tab) as ISelectOption<CurationThreadTypes>
        }
        handleExpandPanel={(filters, type): void => handleExpandPanel(filters, type)}
        handleExpandEvidence={handleExpandEvidence}
      />
    </MainContainer>
  );
}
