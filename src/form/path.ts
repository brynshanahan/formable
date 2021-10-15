import { createContext, useContext, useMemo } from "react";

type Prop = number | string;
export type PathType = Prop[];

export const PathContext = createContext<PathType>([]);

export const Path = {
  SEP: "/",
  PARENT: "..",
  toString(path: PathType) {
    return path.join(Path.SEP);
  },
  fromString(path: string | number) {
    return String(path).split(Path.SEP);
  },
  join(path: Prop | PathType, add: Prop | PathType) {
    let base = Array.isArray(path) ? [...path] : Path.fromString(path);
    let extension = Array.isArray(add) ? [...add] : Path.fromString(add);
    return base.concat(extension);
  }
};

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
