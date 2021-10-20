import { useSelectable } from "@selkt/react";
import { ReactNode, useMemo } from "react";
import { useForm } from "./form";
import { usePath } from "./path";
import { Path, PathType } from "./utils/obj/path/path";
import { get } from "./utils/obj/get-set/get-set";
import { renderChildren } from "./utils/renderChildren";

export function WithForm({
  path: stringPath,
  children
}: {
  path: string;
  children?: (state: any) => ReactNode;
}) {
  const path = useMemo(
    () =>
      stringPath ? ["fields", ...Path.fromString(stringPath)] : ["fields"],
    [stringPath]
  );
  const form = useForm();
  const state = useSelectable(form, (state) => get(state, path));
  return <>{renderChildren(children, state)}</>;
}

type WithFieldPropProps = { prop: string };
type WithFieldPathProps = { path: PathType };
type WithFieldRestProps = {
  children?: (state: any) => ReactNode;
};
export function WithField(
  props: WithFieldPropProps & WithFieldRestProps
): JSX.Element;
export function WithField(
  props: WithFieldPathProps & WithFieldRestProps
): JSX.Element;
export function WithField({
  path,
  prop,
  children
}: (Partial<WithFieldPropProps> & Partial<WithFieldPathProps>) &
  WithFieldRestProps) {
  const parentPath = usePath();
  const currentPath = useMemo(() => {
    if (path) return path;
    if (prop) return Path.join(parentPath, prop);
    return parentPath;
  }, [path, prop]);
  const form = useForm();
  const state = useSelectable(form, (state) => get(state, currentPath));
  return <>{renderChildren(children, state)}</>;
}
