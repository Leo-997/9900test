import {
  cat1CommentPrefix,
  cat2ConsentWithheld,
  germlineFinalReportHasBeenIssued,
  germlineFinalReportWillBeIssued,
} from '@/constants/Reports/comments';
import { ReportCurationComment } from '@/types/Comments/CurationComments.types';
import { IReport, ReportType } from '@/types/Reports/Reports.types';

export function getCommentPrefix(
  category2Consent?: boolean,
): ReportCurationComment[] {
  if (category2Consent === false) {
    return [{
      comment: cat1CommentPrefix,
      reportOrder: -1,
      reportLineBreak: true,
    }];
  }

  return [];
}

export function getGermlineAdditionalComments(
  reportType: ReportType,
  prevGermlineReport: IReport | null,
  category2Consent?: boolean,
): ReportCurationComment[] {
  const germlineReportComment = prevGermlineReport
    ? germlineFinalReportHasBeenIssued
    : germlineFinalReportWillBeIssued;

  const addedComments: ReportCurationComment[] = [];

  if (reportType === 'MOLECULAR_REPORT') {
    addedComments.push({
      comment: germlineReportComment,
      reportOrder: 99,
      reportLineBreak: true,
    });
  }

  if (category2Consent === false) {
    addedComments.push({
      comment: cat2ConsentWithheld,
      reportOrder: 100,
      reportLineBreak: true,
    });
  }

  if (addedComments.length) {
    addedComments.unshift({
      comment: '',
      reportOrder: 98,
      reportLineBreak: true,
    });
  }

  return addedComments;
}
