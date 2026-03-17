/**
 * This file contains SQL queries that were used to set certain
 * dates in the database during the task dashboard release
 *
 * These are kept for historical purposes, but are intended to be used again.
 *
 *

-- Update low risk cohorts that have molecular and germline reports
select a.patient_id, m.approved_at, g.approved_at, t.approved_at, GREATEST(COALESCE(m.approved_at,0), COALESCE(g.approved_at,0)) as greated_date from zcc_analysis_set a
inner join zccreports.zcc_reports m on m.analysis_set_id = a.analysis_set_id and m.type = 'MOLECULAR_REPORT' and m.status = 'approved'
inner join zccreports.zcc_reports g on g.analysis_set_id = a.analysis_set_id and g.type = 'GERMLINE_REPORT' and g.status = 'approved'
left join zccreports.zcc_reports t on t.analysis_set_id = a.analysis_set_id and t.type = 'MTB_REPORT' and t.status = 'approved'
where study = 'zero2'
and cohort not like 'cohort 1 %'
and cohort not like 'cohort 2 %'
and t.approved_at is null
and a.case_finalised_at is null;

update zcc_analysis_set a
inner join zccreports.zcc_reports m on m.analysis_set_id = a.analysis_set_id and m.type = 'MOLECULAR_REPORT' and m.status = 'approved'
inner join zccreports.zcc_reports g on g.analysis_set_id = a.analysis_set_id and g.type = 'GERMLINE_REPORT' and g.status = 'approved'
left join zccreports.zcc_reports t on t.analysis_set_id = a.analysis_set_id and t.type = 'MTB_REPORT' and t.status = 'approved'
set a.case_finalised_at = GREATEST(COALESCE(m.approved_at,0), COALESCE(g.approved_at,0))
where study = 'zero2'
and cohort not like 'cohort 1 %'
and cohort not like 'cohort 2 %'
and t.approved_at is null
and a.case_finalised_at is null;

-- Update cohort 1 and 2 that have a combined cohort report
select a.patient_id, m.approved_at, g.approved_at, t.approved_at, GREATEST(COALESCE(m.approved_at,0), COALESCE(g.approved_at,0), COALESCE(t.approved_at,0)) as greated_date from zcc_analysis_set a
inner join zccreports.zcc_reports m on m.analysis_set_id = a.analysis_set_id and m.type = 'MOLECULAR_REPORT' and m.status = 'approved'
inner join zccreports.zcc_reports g on g.analysis_set_id = a.analysis_set_id and g.type = 'GERMLINE_REPORT' and g.status = 'approved'
left join zccreports.zcc_reports t on t.analysis_set_id = a.analysis_set_id and t.type = 'MTB_REPORT' and t.status = 'approved'
where study = 'zero2'
and (cohort like 'cohort 1 %' or cohort not like 'cohort 2 %')
and a.analysis_set_id in (
  select r.analysis_set_id from zccreports.zcc_reports_metadata meta
    inner join zccreports.zcc_reports r on r.id = meta.report_id
    where meta.`key` = 'molecular.hidePanel' and meta.value = 'true'
);

-- select a.patient_id, m.approved_at, g.approved_at, t.approved_at, GREATEST(COALESCE(m.approved_at,0), COALESCE(g.approved_at,0), COALESCE(t.approved_at,0)) as greated_date from zcc_analysis_set a
update zcc_analysis_set a
inner join zccreports.zcc_reports m on m.analysis_set_id = a.analysis_set_id and m.type = 'MOLECULAR_REPORT' and m.status = 'approved'
inner join zccreports.zcc_reports g on g.analysis_set_id = a.analysis_set_id and g.type = 'GERMLINE_REPORT' and g.status = 'approved'
left join zccreports.zcc_reports t on t.analysis_set_id = a.analysis_set_id and t.type = 'MTB_REPORT' and t.status = 'approved'
set a.case_finalised_at = GREATEST(COALESCE(m.approved_at,0), COALESCE(g.approved_at,0), COALESCE(t.approved_at,0))
where study = 'zero2'
and (cohort like 'cohort 1 %' or cohort not like 'cohort 2 %')
and a.analysis_set_id in (
  select r.analysis_set_id from zccreports.zcc_reports_metadata meta
    inner join zccreports.zcc_reports r on r.id = meta.report_id
    where meta.`key` = 'molecular.hidePanel' and meta.value = 'true'
);

select * from zccreports.zcc_reports where type = 'GERMLINE_REPORT';

-- select all analysis sets that do not have a germline report, but another sample for the same patient does
select a.patient_id, a.cohort, m.approved_at, g.approved_at, t.approved_at, GREATEST(COALESCE(m.approved_at,0), COALESCE(g.approved_at,0), COALESCE(t.approved_at,0)) as greated_date
from zcc_analysis_set a
inner join zccreports.zcc_reports m on m.analysis_set_id = a.analysis_set_id and m.type = 'MOLECULAR_REPORT' and m.status = 'approved'
left join zccreports.zcc_reports g on g.analysis_set_id = a.analysis_set_id and g.type = 'GERMLINE_REPORT' and g.status = 'approved'
left join zccreports.zcc_reports t on t.analysis_set_id = a.analysis_set_id and t.type = 'MTB_REPORT' and t.status = 'approved'
inner join zcc_analysis_set as initial on initial.patient_id = a.patient_id
where a.study = 'zero2' and a.analysis_set_id not in (
    select analysis_set_id from zccreports.zcc_reports where type = 'GERMLINE_REPORT'
  ) and initial.analysis_set_id in (
    select analysis_set_id from zccreports.zcc_reports r
    where r.type = 'GERMLINE_REPORT' and r.status = 'approved'
  ) and a.case_finalised_at is null and a.curation_status = 'DONE';

update zcc_analysis_set a
inner join zccreports.zcc_reports m on m.analysis_set_id = a.analysis_set_id and m.type = 'MOLECULAR_REPORT' and m.status = 'approved'
left join zccreports.zcc_reports g on g.analysis_set_id = a.analysis_set_id and g.type = 'GERMLINE_REPORT' and g.status = 'approved'
left join zccreports.zcc_reports t on t.analysis_set_id = a.analysis_set_id and t.type = 'MTB_REPORT' and t.status = 'approved'
inner join zcc_analysis_set as initial on initial.patient_id = a.patient_id
set a.case_finalised_at = GREATEST(COALESCE(m.approved_at,0), COALESCE(g.approved_at,0), COALESCE(t.approved_at,0))
where a.study = 'zero2' and a.analysis_set_id not in (
  select analysis_set_id from zccreports.zcc_reports where type = 'GERMLINE_REPORT'
) and initial.analysis_set_id in (
  select analysis_set_id from zccreports.zcc_reports r
  where r.type = 'GERMLINE_REPORT' and r.status = 'approved'
) and a.case_finalised_at is null and a.curation_status = 'DONE';

-- odd cases
select a.patient_id, m.approved_at, g.approved_at, t.approved_at, GREATEST(COALESCE(m.approved_at,0), COALESCE(g.approved_at,0), COALESCE(t.approved_at,0)) as greated_date from zcc_analysis_set a
left join zccreports.zcc_reports m on m.analysis_set_id = a.analysis_set_id and m.type = 'MOLECULAR_REPORT' and m.status = 'approved'
left join zccreports.zcc_reports g on g.analysis_set_id = a.analysis_set_id and g.type = 'GERMLINE_REPORT' and g.status = 'approved'
left join zccreports.zcc_reports t on t.analysis_set_id = a.analysis_set_id and t.type = 'MTB_REPORT' and t.status = 'approved'
where study = 'zero2'
and a.patient_id in (
  '01-0084',
  '01-0117',
  '01-0155',
  '01-0156',
  '01-0158',
  '01-0165',
  '01-0169',
  '01-0201',
  '01-0206',
  '01-0228',
  '01-0230',
  '01-0251',
  '02-0113',
  '02-0137',
  '02-0140',
  '02-0153',
  '02-0200',
  '03-0027',
  '03-0038',
  '03-0047',
  '04-0020',
  '04-0053',
  '04-0098',
  '04-0108',
  '04-0113',
  '04-0136',
  '04-0170',
  '04-0179',
  '04-0183',
  '04-0207',
  '04-0213',
  '04-0227',
  '04-0230',
  '05-0029',
  '05-0035',
  '05-0038',
  '05-0061',
  '05-0083',
  '06-0048',
  '06-0151',
  '06-0171',
  '06-0181',
  '06-0205',
  '06-0214',
  '06-0223',
  '06-0293',
  '07-0014',
  '07-0032',
  '07-0035',
  '07-0077',
  '07-0082',
  '07-0106',
  '07-0108',
  '07-0124',
  '07-0136',
  '07-0150',
  '08-0019',
  '08-0085'
);

-- Cancel pending reports that were created more than 3 months ago
update zccreports.zcc_reports pending
inner join zccreports.zcc_reports approved on approved.analysis_set_id = pending.analysis_set_id and approved.type = pending.type and approved.status = 'approved'
set pending.status = 'cancelled'
where pending.created_at < '2025-03-01 00:00:00'
and pending.status = 'pending';

-- Cancel pending reports that are not needed (must be opened accidentally)
-- These have a previously issued report of the same type
update zccreports.zcc_reports
set status = 'cancelled'
where status = 'pending' and analysis_set_id in (
  '36JRbJBs',
  '3kvaonMR',
  '5kDqjZ2U',
  'aD3BW2kK',
  'azvGSeuq',
  'Dtvj4SoU',
  'euagVmvg',
  'gkDafCmk',
  'm5j5H9EN',
  'mPJnSSwr',
  'PD5iewts',
  'SCBYkdDD',
  'SfEJRDnR',
  'V8nNVMyB'
);

-- reopen case
UPDATE `zcczerodashhg38`.`zcc_analysis_set` set case_finalised_at = null where analysis_set_id = 'SoiouMXN';

-- Set the analysis set as withdrawn and close them
select * from zcc_analysis_set;
UPDATE `zcczerodashhg38`.`zcc_analysis_set` SET `curation_status` = 'Withdrawn', `case_finalised_at` = '2023-12-14 13:00:00' WHERE (`analysis_set_id` = '9eEU8xr2');
UPDATE `zcczerodashhg38`.`zcc_analysis_set` SET `curation_status` = 'Withdrawn', `case_finalised_at` = '2024-03-23 13:00:00' WHERE (`analysis_set_id` = 'jAd5yeqJ');
UPDATE `zcczerodashhg38`.`zcc_analysis_set` SET `curation_status` = 'Withdrawn', `case_finalised_at` = '2024-11-20 13:00:00' WHERE (`analysis_set_id` = 'jFjfsU2D');
UPDATE `zcczerodashhg38`.`zcc_analysis_set` SET `curation_status` = 'Withdrawn', `case_finalised_at` = '2024-03-23 13:00:00' WHERE (`analysis_set_id` = 'R2JS4zRZ');
UPDATE `zcczerodashhg38`.`zcc_analysis_set` SET `curation_finalised_at` = '2023-08-25 02:18:00', `case_finalised_at` = '2023-08-25 02:18:00' WHERE (`analysis_set_id` = 'gMAUgxGn');
UPDATE `zcczerodashhg38`.`zcc_analysis_set` SET `curation_status` = 'Withdrawn', `case_finalised_at` = '2024-07-16' WHERE (`analysis_set_id` = 'aLZMrkT6');

-- Set the analysis set as failed and close the case
UPDATE `zcczerodashhg38`.`zcc_analysis_set` SET `curation_status` = 'Failed', `case_finalised_at` = `curation_finalised_at` WHERE (`analysis_set_id` = 'HjcALF46');
UPDATE `zcczerodashhg38`.`zcc_analysis_set` SET `curation_status` = 'Failed', `case_finalised_at` = '2024-12-17 00:00:00' WHERE (`analysis_set_id` = 'KPbzogmx');

-- close pending reports that have no previously issued
select * from zccreports.zcc_reports;
UPDATE `zccreports`.`zcc_reports` SET `approved_at` = '2025-01-10 13:00:00' WHERE (`id` = 'ef20064d-5297-4f17-9953-110ba66e9533');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'approved', `approved_at` = '2025-01-10 13:00:00' WHERE (`id` = 'a4870edb-b81a-44b2-bb7a-dc1cbaeb4387');
UPDATE `zccreports`.`zcc_reports` SET `pseudo_status` = 'N/A' WHERE (`id` = '93004cc7-50c4-4e85-b417-807cc59cfb49');
UPDATE `zccreports`.`zcc_reports` SET `pseudo_status` = 'N/A' WHERE (`id` = '7cd19a4e-eced-437d-9ef1-770c3a086a8a');
UPDATE `zccreports`.`zcc_reports` SET `pseudo_status` = 'N/A' WHERE (`id` = '72c3b9e0-e71b-4d22-a51b-3396e123547b');
UPDATE `zccreports`.`zcc_reports` SET `pseudo_status` = 'N/A' WHERE (`id` = 'a7a432b4-770b-44cc-a865-a1738dc7ab69');
UPDATE `zccreports`.`zcc_reports` SET `pseudo_status` = 'N/A' WHERE (`id` = '94f36733-249a-4a2a-9600-f737d032f053');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'approved', `approved_at` = '2024-09-12 13:00:00' WHERE (`id` = '76d33614-ba42-41c5-8b22-517a08833c44');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'approved', `approved_at` = '2024-02-26 13:00:00' WHERE (`id` = '3c4f6c4e-8af2-494c-9698-42d482d7b3bd');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'approved', `approved_at` = '2023-06-23 13:00:00' WHERE (`id` = 'dc844c51-e46f-412c-b93a-4b90906a5268');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'approved', `approved_at` = '2024-01-22 13:00:00' WHERE (`id` = 'ca120852-c769-4326-b80d-b51c389527df');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'approved', `approved_at` = '2023-12-18 13:00:00' WHERE (`id` = '4db11261-ff1b-407a-b30d-a2744ba2fbd4');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'approved', `approved_at` = '2023-05-10 14:00:00' WHERE (`id` = '94aa9f68-cf11-48e4-8620-4c808a5f181f');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'approved', `approved_at` = '2024-02-11 13:00:00' WHERE (`id` = '13e420c1-a826-4aee-a682-c026ccddab46');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'cancelled' WHERE (`id` = '69a22551-17f0-48be-87e7-30f19dc9baf7');

-- SET MTB reports to pending
UPDATE `zccreports`.`zcc_reports` SET `status` = 'pending', `approved_at` = NULL WHERE (`id` = '5504f1d7-1eb1-49d0-9941-66f45a1dccde');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'pending', `approved_at` = NULL WHERE (`id` = '3fcb008d-b30b-4247-be4e-358138e6e73a');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'pending', `approved_at` = NULL WHERE (`id` = 'adb2978f-10e0-4b57-983c-e27ddfa79b41');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'pending', `approved_at` = NULL WHERE (`id` = '8c274ca6-9972-4d12-ad74-5bc6e993bedb');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'pending', `approved_at` = NULL WHERE (`id` = 'dbe9b416-a0ba-43f0-b7e4-9ae991152b36');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'pending', `approved_at` = NULL WHERE (`id` = '9b70fc98-fb28-4c07-8869-45beadc567bd');
UPDATE `zccreports`.`zcc_reports` SET `status` = 'pending', `approved_at` = NULL WHERE (`id` = '28f5e010-d32a-4a1e-870c-55919f342af3');

-- correct MTB report date
UPDATE `zccreports`.`zcc_reports` SET `approved_at` = '2025-05-15 13:00:00' WHERE (`id` = '02d4c05a-d2a7-4aba-9f33-852003c1403e');
UPDATE `zccreports`.`zcc_reports` SET `approved_at` = '2025-05-12 13:00:00' WHERE (`id` = '6d7c70a9-7a4e-4b41-8c47-ae7acc68d6e0');
UPDATE `zccreports`.`zcc_reports` SET `approved_at` = '2025-05-12 13:00:00' WHERE (`id` = '8a69a084-0190-4c68-add2-f2ac83f2ced6');
UPDATE `zccreports`.`zcc_reports` SET `approved_at` = '2025-05-14 01:50:08' WHERE (`id` = '612c1521-9b9e-486d-8431-a98bdf2ae543');

-- correct MTB status
select * from zccclinical.zcc_clinical_versions;
UPDATE `zccclinical`.`zcc_clinical_versions` SET `status` = 'Done' WHERE (`id` = '622d9742-417d-4c80-b1e1-1916c41c20e4');

-- add missing Molecular report
INSERT INTO `zccreports`.`zcc_reports` (`id`, `analysis_set_id`, `type`, `status`, `approved_at`, `file_id`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES ('d3c85c56-31d5-40bf-baf1-05da7f48d7f7', 'Bxr9p5kB', 'MOLECULAR_REPORT', 'approved', '2024-07-29 00:00:00', NULL, '2024-07-29 00:00:00', 'sysadmin', NULL, NULL);
INSERT INTO `zccreports`.`zcc_reports` (`id`, `analysis_set_id`, `type`, `status`, `approved_at`, `file_id`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES ('524b770b-65a5-414c-bf3e-ec3be525847a', 'bTpVJHNN', 'GERMLINE_REPORT', 'approved', '2025-05-21 00:00:00', NULL, '2025-05-21 00:00:00', 'sysadmin', NULL, NULL);
INSERT INTO `zccreports`.`zcc_reports` (`id`, `analysis_set_id`, `type`, `status`, `approved_at`, `file_id`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES ('89f8a4a7-2bf6-4f3d-8404-bf5ff68da90b', 'HxJw9pTX', 'GERMLINE_REPORT', 'approved', '2025-05-21 00:00:00', NULL, '2025-05-21 00:00:00', 'sysadmin', NULL, NULL);

 */
