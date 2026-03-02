/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Transform } from 'class-transformer';

export function ToArray() {
  return Transform(({ value }) => {
    return Array.isArray(value) ? value : [value];
  });
}
