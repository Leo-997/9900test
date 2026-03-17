/* eslint-disable @typescript-eslint/naming-convention */
export type CommonScopes =
  // File Tracker
  | 'file.download' // Download files

  // Evidence (related to MS)
  | 'evidence.write' // Create evidence for the MS
  | 'evidence.download' // Download evidence from the MS

  // Report
  | 'report.read' // View all reports
  | 'report.assign' // Assign an approver to a report
  | 'report.meta.write' // Edit information about the report, but not the content (hide panel etc)
  | 'report.mtb.write' // Edit actions for the MTB report (interpretations, comments)
  | 'report.mtb.content.write' // Edit actions for the MTB report content (clinical information, recommendations)
  | 'report.molecular.write' // Edit actions for the molecular report (request approval, assign approver)
  | 'report.molecular.content.write' // Edit actions for the molecular report content (summary)
  | 'report.germline.write' // Edit actions for the germline report (request approval, assign approver)
  | 'report.germline.content.write' // Edit actions for the germline report content (interpretation)
  | 'report.preclinical.write' // Edit actions for the preclinical report (request approval, assign approver)
  | 'report.preclinical.content.write' // Edit actions for the preclinical report content (interpretation)
  | 'report.redacted.write' // Generate a redacted version of a report
  | 'report.download' // Download a report (PDF, DOCX)
  | 'report.finalise' // Finalise a report and generate the document

  // Curation atlas
  | 'atlas.read' // View atlas
  | 'atlas.write'; // Edit atlas

export type CurationScopes =
  CommonScopes
  | 'curation.sample.read' // View samples on dashboard, as well as curation flow
  | 'curation.sample.write' // Global edit actions (curation status, expedite, curation date, assign user, etc)
  | 'curation.sample.assigned.write' // Edit actions for assigned curators only
  | 'curation.status.write' // Global permission for all updates related to a sample's curation status
  | 'curation.sample.hts.write' // Edit actions for HTS data
  | 'curation.evidence.write' // Edit/delete evidence on a variant level
  | 'curation.gene.list.write' // Create gene lists (admin only)
  | 'curation.germline.gene.list.read' // Change the germline gene lists
  | 'curation.sample.download' // Generate and Download plots
  | 'curation.sample.hts.download' // Download and export HTS data
  | 'curation.patient.write'; // Edit enrolled / withdrawn patient notes on Sampleless Patient Dashboard

export type ClinicalScopes =
  CommonScopes
  | 'clinical.sample.read' // View samples on dashboard, as well as clinical flow
  | 'clinical.sample.write' // Global edit actions (clinical status, expedite, MTB date, assign user, etc)
  | 'clinical.sample.assigned.write' // Edit actions for assigned users only (curators and clinicians)
  | 'clinical.drug.validation.write' // validate drugs in drug validation dashboard
  | 'common.sample.suggestion.write'; // Add and resolve clinical comments

export type Scope = CommonScopes | CurationScopes | ClinicalScopes;
