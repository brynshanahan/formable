import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef
} from "react";
import { FormKey, FormState, useFormState } from "./hooks/use-form-state";
import { AnySelectable } from "./types";
import { Selectable } from "@selkt/core";
import { FormUnGroup } from "./group";

interface FormProps<FieldState> {
  initialValue?: FieldState;
  value?: FieldState;
  state?: AnySelectable<FormState<FieldState>>;
  children?: ReactNode;
  onSubmit?: (state: FieldState) => any;
  onChange?: (state: FieldState) => any;
}

export const FormStateContext = createContext<Selectable<FormState<any>>>(
  new Selectable({
    fields: {},
    meta: {},
    validators: new Map()
  })
);

export const useForm = () => {
  return useContext(FormStateContext);
};

export function getFormErrors(form: FormState<any>) {
  const errors = [];
  let errorsCount = 0;
  for (let [path, meta] of Object.entries(form.meta)) {
    if (meta.errors?.length) {
      errors.push([path, meta.errors]);
      errorsCount += meta.errors.length;
    }
  }
  return { errors, count: errorsCount };
}

export function Form<FieldState>({
  children,
  onSubmit,
  onChange,
  state,
  value,
  initialValue = value
}: FormProps<FieldState>) {
  const [form] = useFormState<FieldState>(
    (state as AnySelectable<FormState<FieldState>>) || initialValue
  );

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Call onChange anytime inner fields change on the form object
  useEffect(() => {
    return form.select(
      (state) => state.fields,
      (fields) => {
        onChangeRef.current?.(fields);
      }
    );
  }, [form]);

  /* Update to initial value */
  const initialValueRef = useRef(initialValue);
  useLayoutEffect(() => {
    const initialVal = initialValueRef.current;
    if (initialVal !== undefined) {
      form.set((state) => {
        state.fields = initialVal;
      });
    }
  }, [form]);

  /* Controlled value changes */
  useLayoutEffect(() => {
    if (value !== undefined) {
      form.set((state) => {
        state.fields = value;
      });
    }
  }, [value, form]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.set((state) => {
          Object.keys(state.meta).forEach((key) => {
            state.meta[key].dirty = true;
          });
        });
        const { errors } = getFormErrors(form.state);
        if (!errors.length) {
          onSubmit?.(form.state.fields);
        }
      }}
    >
      <FormStateContext.Provider value={form}>
        <FormUnGroup>{children}</FormUnGroup>
      </FormStateContext.Provider>
      <button
        type="submit"
        style={{
          height: "0px",
          width: "0px",
          padding: "0px",
          appearance: "none",
          border: 0,
          outline: "none"
        }}
      />
    </form>
  );
}
