import { createContext, useContext, useMemo } from "react";
import { PathType, Path } from './utils/obj/path/path';

export const PathContext = createContext<PathType>([]);


export function usePath(prop?: string | number): (string | number)[] {
  const parentPath = useContext(PathContext);
  return useMemo(() => {
    if (prop || prop === 0) {
      const parts = Path.fromString("" + prop);
      const result = [...parentPath];

      for (let key of parts) {
        if (key === Path.PARENT) {
          result.pop();
        } else {
          result.push(key);
        }
      }

      return result;
    } else {
      return parentPath;
    }
  }, [parentPath, prop]);
}
