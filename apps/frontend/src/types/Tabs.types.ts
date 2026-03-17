import { ReactNode } from "react";

export interface TabProps {
  label: string;
  to: string;
  altPaths?: string[];
  children: ReactNode;
}
