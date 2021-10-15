import { PropsWithChildren, ReactNode, useMemo } from "react";
import { usePath, PathContext } from "./path";

/* Resets scope to the form root */
export function FormUnGroup({ children }: PropsWithChildren<{}>) {
  const initialPath = useMemo(() => ["fields"], []);
  return (
    <PathContext.Provider value={initialPath}>{children}</PathContext.Provider>
  );
}

/* Endeepens the scope */
export function FormGroup({
  prop,
  children
}: {
  prop?: string | number;
  children?: ReactNode;
}) {
  const path = usePath(prop);
  return <PathContext.Provider value={path}>{children}</PathContext.Provider>;
}
