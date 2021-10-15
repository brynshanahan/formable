import { ReactNode } from "react";

export function renderChildren<T extends any[]>(
  children?: ReactNode | ((...args: T) => ReactNode),
  ...args: T
) {
  if (typeof children === "function") {
    return children(...args);
  } else {
    return children ? <>{children}</> : null;
  }
}
