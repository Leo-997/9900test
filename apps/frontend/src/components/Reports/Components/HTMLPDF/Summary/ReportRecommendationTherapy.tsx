import CustomTypography from '@/components/Common/Typography';
import { CommentModes, RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { ITherapyDrug } from '@/types/Drugs/Drugs.types';
import { IFetchRecommendation } from '@/types/MTB/Recommendation.types';
import { ITherapy } from '@/types/Therapies/ClinicalTherapies.types';
import {
  Box, TableCell, TableRow,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { Fragment, type JSX } from 'react';

const useStyles = makeStyles(() => ({
  tableCell: {
    padding: '0px',
    borderBottom: 'none',
    verticalAlign: 'top',
  },
  tableCellTier: {
    width: '90px',
  },
  bodyFontSize: {
    fontSize: '13px !important',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& *': {
      fontSize: '13px !important',
    },
  },
}));

interface IProps {
  recommendation: IFetchRecommendation;
  commentMode?: CommentModes;
  hideComments?: boolean;
}

export default function ReportRecommendationTherapy({
  recommendation,
  commentMode = 'readOnly',
  hideComments = true,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const getTier = (tier: string | undefined): string => {
    if (!tier || tier === 'No tier') return '';

    return `Tier ${tier}`;
  };

  const getChemoContent = (therapy?: ITherapy): string => {
    if (!therapy) return '';

    const lines: string[] = [];
    if (therapy.chemotherapyNote) lines.push(therapy.chemotherapyNote);
    if (therapy.radiotherapyNote) lines.push(therapy.radiotherapyNote);
    if (therapy.chemotherapy && !therapy.chemotherapyNote) lines.push('chemotherapy');
    if (therapy.radiotherapy && !therapy.radiotherapyNote) lines.push('radiotherapy');
    if (lines.length) return ` + ${lines.join(' + ')}`;

    return '';
  };

  const getDrugName = (drug: ITherapyDrug): string => {
    if (!drug.externalDrug) {
      return drug.class.name ?? '';
    }

    return drug.externalDrug.name;
  };

  const handleSaveRecDescription = (
    rec: IFetchRecommendation,
    description: string,
  ): void => {
    zeroDashSdk.mtb.recommendation.updateRecommendation(
      rec.clinicalVersionId,
      rec.id,
      {
        description,
      },
    );
  };

  return (
    <TableRow>
      <TableCell
        className={clsx(classes.tableCell, classes.tableCellTier)}
        style={{ paddingRight: '8px' }}
      >
        <CustomTypography variant="bodySmall" className={classes.bodyFontSize}>
          {getTier(recommendation.tier)}
        </CustomTypography>
      </TableCell>
      <TableCell className={classes.tableCell}>
        <Box
          display="flex"
          flexDirection="row"
          gap="8px"
          alignItems="center"
          flexWrap="wrap"
        >
          <CustomTypography variant="bodySmall" className={classes.bodyFontSize}>
            {recommendation.therapy?.drugs.map((drug, i) => (
              <Fragment key={`${drug.class.id} ${drug.externalDrugVersionId}`}>
                {i !== 0 && (
                  ' + '
                )}
                {getDrugName(drug)}
              </Fragment>
            ))}
            {getChemoContent(recommendation.therapy)}
          </CustomTypography>
        </Box>
        <CustomTypography variant="bodySmall" className={classes.bodyFontSize}>
          <RichTextEditor
            hideEmptyEditor
            mode="readOnly"
            initialText={recommendation.description}
            condensed
            hideEvidence
            commentMode={commentMode}
            hideComments={hideComments}
            onSave={(newVal): void => handleSaveRecDescription(recommendation, newVal)}
          />
        </CustomTypography>
      </TableCell>
    </TableRow>
  );
}
