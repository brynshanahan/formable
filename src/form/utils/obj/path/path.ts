export type Prop = number | string;
export type PathType = Prop[] | Prop;
export const Path = {
  SEP: ".",
  PARENT: "..",
  join(path: PathType, add: PathType) {
    return Path.toArray(path).concat(Path.toArray(add))
  },
  toString(path: PathType): string {
    if (typeof path === 'string') return path
    if (typeof path === 'number') return String(path)
    return path.join(Path.SEP);
  },
  toArray (path: PathType): Prop[] {
    if (typeof path === 'string') {
      return path.split(Path.SEP)
    } else if (typeof path === 'number') {
      return [String(path)]
    } else {
      return path
    }
  }
};
