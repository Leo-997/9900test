import { IAnnex1Row } from '../../types/Reports/Reports.types';

export const nswClinics: IAnnex1Row = {
  region: 'New South Wales',
  clinics: [
    {
      location: 'Sydney Children\'s Hospital',
      service: {
        service: 'Kids Cancer Genetics Clinic, Kids Cancer Centre',
        hospital: 'Sydney Children\'s Hospital Randwick',
      },
      email: 'SCHN-SCH-PaedCPS@health.nsw.gov.au',
    },
    {
      location: 'Children\'s Hospital Westmead',
      service: {
        service: 'Department of Clinical Genetics',
        hospital: 'The Children\'s Hospital at Westmead',
      },
      email: 'SCHN-CHW-ClinicalGenetics@health.nsw.gov.au',
    },
    {
      location: 'Westmead Hospital (adult patients)',
      service: {
        service: 'Familial Cancer Service (Adult)',
        hospital: 'Westmead Hospital',
      },
      email: 'WestmeadFCS@health.nsw.gov.au',
    },
    {
      location: 'John Hunter Hospital',
      service: {
        service: 'Hunter Family Cancer Service',
        hospital: 'John Hunter Hospital',
      },
      email: 'HNELHD-Genetics@health.nsw.gov.au',
    },
  ],
};

export const vicClinics: IAnnex1Row = {
  region: 'Victoria',
  clinics: [
    {
      location: 'The Royal Children\'s Hospital',
      service: {
        service: 'Victorian Clinical Genetics Services',
      },
      email: 'vcgs@vcgs.org.au',
    },
    {
      location: 'Monash Children’s Hospital',
      service: {
        service: 'Monash Familial Cancer Centre',
        hospital: 'Monash Medical Centre',
      },
      email: 'familial.cancer@monashhealth.org',
    },
  ],
};

export const waClinics: IAnnex1Row = {
  region: 'Western Australia',
  clinics: [
    {
      location: 'Perth Children’s Hospital',
      service: {
        service: 'Familial Cancer Program',
        hospital: 'King Edward Memorial Hospital',
      },
      email: 'gswa@health.wa.gov.au',
    },
  ],
};

export const qldClinics: IAnnex1Row = {
  region: 'Queensland',
  clinics: [
    {
      location: 'Queensland Children’s Hospital',
      service: {
        service: 'Genetic Health Queensland',
        hospital: 'Royal Brisbane and Women’s Hospital',
      },
      email: 'ghq@health.qld.gov.au',
    },
  ],
};

export const saClinics: IAnnex1Row = {
  region: 'South Australia',
  clinics: [
    {
      location: 'Women’s and Children’s Hospital',
      service: {
        service: 'South Australian Clinical Genetics Service',
        hospital: 'Royal Adelaide Hospital',
      },
      email: 'adultgenetics@sa.gov.au',
    },
  ],
};

export const tasClinics: IAnnex1Row = {
  region: 'Tasmania',
  clinics: [
    {
      location: 'Royal Hobart Hospital',
      service: {
        service: 'Tasmanian Clinical Genetics Service',
        hospital: 'Royal Hobart Hospital',
      },
      email: 'tcgs@ths.tas.gov.au',
    },
  ],
};

export const nzClinics: IAnnex1Row = {
  region: 'New Zealand',
  clinics: [
    {
      location: 'Christchurch Hospital',
      service: {
        service: 'South Island Hub',
        hospital: 'Christchurch Hospital',
      },
      email: 'genetic.servicenz@cdhb.health.nz',
    },
    {
      location: 'Auckland City Hospital',
      service: {
        hospital: 'Auckland City Hospital',
      },
      email: 'GenSec@adhb.govt.nz',
    },
  ],
};
