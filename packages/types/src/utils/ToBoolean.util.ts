/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { Transform } from 'class-transformer';

export function ToBoolean() {
  return Transform(({ value }) => {
    switch (value) {
      case 'true':
        return true;
      case 'false':
        return false;
      case 'null':
        return null;
      default:
        return value;
    }
  });
}
