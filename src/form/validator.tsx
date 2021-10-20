import { useSelectable } from "@selkt/react";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import { useForm } from "./form";
import { useIdentity } from './hooks/use-identity';
import { usePath } from "./path";
import { Path, PathType } from "./utils/obj/path/path";
import { del, get, set } from "./utils/obj/get-set/get-set";

function requiredFn(v: any) {
  return !!v;
}

function useDirty(path: PathType) {
  const form = useForm();
  const pathString = Path.toString(path);
  return useSelectable(form, (state) => state.meta[pathString]?.dirty);
}

function hasIndex(index: undefined | number) {
  if (index === undefined || index === -1) return false;
  return true;
}

export function Validator<T>({
  required,
  isValid = required ? requiredFn : undefined,
  prop,
  children
}: {
  prop?: string;
  required?: boolean;
  isValid?: (type: T) => undefined | boolean;
  children: ReactNode | string;
}) {
  const identity = useIdentity();
  const form = useForm();
  const path = usePath(prop);
  const dirty = useDirty(path);
  const p = Path.toString(path);
  const errors = useSelectable(form, (state) => state.meta[p]?.errors);
  const hasError = useMemo(
    () => errors && errors.find((ref) => ref[0] === identity),
    [errors]
  );

  /* Subscribe to form value changes and update error status */
  useEffect(() => {
    if (!isValid) return;

    return form.select(
      (state) => {
        /* We only want to validate this value when the field is dirty */
        if (state.meta[p]?.dirty) {
          return get(state, path) as T;
        } else {
          return null;
        }
      },
      (value) => {
        if (value === null) return;
        const isValueValid = isValid(value);

        let errorIndex = form.state.meta[p]?.errors?.findIndex(
          (err) => err[0] === identity
        );

        if (!isValueValid) {
          form.set((state) => {
            /* Create a default error map */
            if (!state.meta[p]?.errors) set(state.meta, [p, "errors"], []);

            if (hasIndex(errorIndex)) {
              /* Overwrite the previous error */
              state.meta[p].errors[errorIndex][1] = children;
            } else {
              /* Add the current error */
              state.meta[p].errors.push([identity, children]);
            }
          });
        } else {
          if (hasIndex(errorIndex)) {
            form.set((state) => {
              /* Remove the previous error */
              state.meta[p].errors.splice(errorIndex, 1);
              if (!state.meta[p].errors.length) {
                del(state.meta, [p, "errors"], true);
              }
            });
          }
        }
      }
    );
    // eslint-disable-next-line
  }, [isValid, form, path, p]);

  /* Remove errors if the form is changed from dirty to nondirty */
  useEffect(() => {
    if (!dirty) {
      const errorIndex = form.state.meta[p]?.errors?.findIndex(
        (err) => err[0] === identity
      );
      form.set((state) => {
        if (hasIndex(errorIndex)) {
          state.meta[p].errors?.splice(errorIndex, 1);
          if (!state.meta[p].errors.length) {
            del(state.meta, [p, "errors"], true);
          }
        }
      });
    }
  }, [dirty, form, p]);

  /* Delete error's on unmount */
  useEffect(() => {
    return () => {
      const errorIndex = form.state.meta[p]?.errors?.findIndex(
        (err) => err[0] === identity
      );
      form.set((state) => {
        if (hasIndex(errorIndex)) {
          state.meta[p].errors?.splice(errorIndex, 1);
          if (!state.meta[p].errors.length) {
            del(state.meta, [p, "errors"], true);
          }
        }
      });
    };
  }, [p, form]);

  return hasError ? (hasError[1] as any) : null;
}
