import { createContext, ReactNode, useContext, useMemo, type JSX } from 'react';

interface IRTETableContext {
  flexibleTableWidth: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const RTETableContext = createContext<IRTETableContext | undefined>(undefined);

export const useRTETable = (): IRTETableContext => {
  const ctx = useContext(RTETableContext);

  if (!ctx) {
    throw new Error('RTEComments context cannot be used at this scope');
  }

  return ctx;
};

interface IProps {
  flexibleTableWidth?: boolean;
  children?: ReactNode;
}

export function RTETableProvider({ children, flexibleTableWidth = false }: IProps): JSX.Element {
  const value = useMemo(() => ({
    flexibleTableWidth,
  }), [flexibleTableWidth]);

  return (
    <RTETableContext.Provider value={value}>
      {children}
    </RTETableContext.Provider>
  );
}
