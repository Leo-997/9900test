import { Inframe } from '../../types/Common.types';
import { getInframeLegend } from '../../utils/functions/inframeUtils';

import type { JSX } from "react";

interface IProps {
  inframe: Inframe,
}

export default function InframeTooltip({
  inframe,
}: IProps): JSX.Element | null {
  return getInframeLegend(inframe).length > 0
    ? (
      <ul style={{ paddingLeft: '16px' }}>
        {getInframeLegend(inframe).map((line) => (
          <li>{line}</li>
        ))}
      </ul>
    ) : (
      null
    );
}
