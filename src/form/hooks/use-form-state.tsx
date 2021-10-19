import { Selectable } from "@selkt/core";
import { ReactNode, useCallback, useMemo, useRef } from "react";

import { AnySelectable } from "../types";

export interface FormState<
  FieldState extends { [k: string]: any } = { [k: string]: any }
> {
  meta: {
    [path: string]: {
      dirty: boolean;
      focus: true;
      refs: any[];
      errors: [any /* (Ref ID) */, ReactNode /* ChildrenToRender */][];
    };
  };
  fields: FieldState;
}

function isSelectable<T = any>(obj: any): obj is AnySelectable<T> {
  return (
    typeof obj === "object" &&
    typeof obj.select === "function" &&
    typeof obj.subscribe === "function"
  );
}

type Reset = () => void;

const initialFormMeta = {};

export function createFormState<T extends { [k: string]: any }>(
  initialValue: T = {} as T
) {
  return new Selectable<FormState<T>>({
    meta: initialFormMeta,
    fields: initialValue
  });
}

export function useFormState<FieldState>(
  initialValue?: FieldState
): [AnySelectable<FormState<FieldState>>, Reset];
export function useFormState<FieldState>(
  selectable?: AnySelectable<FormState<FieldState>>
): [AnySelectable<FormState<FieldState>>, Reset];
export function useFormState<FieldState>(
  selectable?: undefined
): [AnySelectable<FormState<FieldState>>, Reset];
export function useFormState<FieldState>(
  selectableOrInitialValue?:
    | AnySelectable<FormState<FieldState>>
    | FieldState
    | undefined
): [AnySelectable<FormState<FieldState>>, Reset] {
  const isCurrentSelectable = isSelectable(selectableOrInitialValue);
  /* 
  We want memo to rerun when a passed in a new selectable instance
  We dont want it to rerun when an initialValue changes
  */
  const selectableDependancy = isCurrentSelectable && selectableOrInitialValue;

  const initialValueRef = useRef(selectableDependancy);

  const state = useMemo((): Selectable<FormState<FieldState>> => {
    if (isCurrentSelectable) {
      return selectableOrInitialValue;
    } else {
      return createFormState<FieldState>(selectableOrInitialValue);
    }
  }, [selectableDependancy, isCurrentSelectable]);

  const reset = useCallback(() => {
    state.set((s) => {
      s.meta = initialFormMeta;
      s.fields = isSelectable(initialValueRef.current)
        ? initialValueRef.current.state.fields
        : initialValueRef.current;
    });
  }, []);

  return [state, reset];
}
