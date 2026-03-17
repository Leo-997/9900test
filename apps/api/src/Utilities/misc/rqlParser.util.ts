const opsRegex = /(eq|ne|like|lt|le|gt|ge)\((.*)\)/;
const equalityOperatorList = ['eq', 'ne', 'like'];
const rangeOperatorList = ['lt', 'le', 'gt', 'ge'];
const operatorList = [...equalityOperatorList, ...rangeOperatorList];

interface IOperatorMap {
  $eq: '=';
  $ne: '<>';
  $lt: '<';
  $le: '<=';
  $gt: '>';
  $ge: '>=';
  $like: 'LIKE';
}

const operatorMap: IOperatorMap = {
  $eq: '=',
  $ne: '<>',
  $lt: '<',
  $le: '<=',
  $gt: '>',
  $ge: '>=',
  $like: 'LIKE',
};

export const rqlParser = {
  opsRegex,
  equalityOperatorList,
  rangeOperatorList,
  operatorList,
  operatorMap,
};
