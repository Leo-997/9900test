import { Knex } from 'knex';

export function filterClassification(
  qb: Knex.QueryBuilder,
  classificationColumn: string,
  classificationFilter: boolean,
): void {
  qb.andWhere((q) => {
    // Filter reportable on either
    // 1) Classification is null
    // 2) Is reportable
    // 3) Is not reportable

    if (classificationFilter !== undefined) {
      if (classificationFilter === null) {
        q.whereNull(classificationColumn).orWhere(classificationColumn, '');
      } else if (classificationFilter) {
        q.whereNotNull(classificationColumn)
          .andWhere(classificationColumn, '<>', 'Not reportable')
          .andWhere(classificationColumn, '<>', 'Not Applicable')
          .andWhere(classificationColumn, '<>', '')
          .andWhereNot(classificationColumn, '0');
      } else if (!classificationFilter) {
        q.whereNotNull(classificationColumn).andWhere(
          classificationColumn,
          'Not reportable',
        );
      }
    }
  });
}
