import { Knex } from 'knex';

export function withPagination(
  qb: Knex.QueryBuilder,
  page: number,
  limit: number,
): void {
  let currentPage = page;
  if (page < 1) {
    currentPage = 1;
  }
  const offset = (currentPage - 1) * limit;

  qb.offset(offset).limit(limit);
}
