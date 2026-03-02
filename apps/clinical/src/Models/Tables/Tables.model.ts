import { Knex } from 'knex';
import { IPatientBase } from '../Patient/Patient.model';
import { ISlide } from '../Slide/Slide.model';
import { IUser } from '../User/User.model';

declare module 'knex/types/tables' {

  interface ITables {

    zcc_clinical_patients: Knex.CompositeTableType<IPatientBase, any>;
    zcc_users: Knex.CompositeTableType<
      IUser
    >;
    zcc_clinical_slides: Knex.CompositeTableType<
      ISlide,
      Omit<ISlide, 'hidden' | 'alterations' | 'slideNote' | 'reportNote'> & { mol_alteration_group_id: string; is_hidden: boolean; slide_note: string; report_note: string; },
      Partial<ISlide>
    >;
  }
}
