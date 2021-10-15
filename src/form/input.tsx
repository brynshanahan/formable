import React, { ChangeEvent, useEffect, useLayoutEffect, useRef } from "react";
import { useSelectable } from "@selkt/react";
import { useForm } from "./form";
import { del, get, set } from "./utils/getset";
import { InputComponents, InputProps, InputTypes } from "./types";
import { Path, PathContext, usePath } from "./path";
function isCheckedInputType(type: string) {
  return type === "radio" || type === "checkbox";
}

function formatValue(
  htmlValue: string | boolean,
  type: InputTypes,
  clean: boolean,
  maskValue: any
) {
  const isCheckedType = isCheckedInputType(type);
  if (isCheckedType) {
    if (htmlValue) {
      return maskValue || true;
    } else {
      return clean ? undefined : false;
    }
  } else {
    return htmlValue || (clean ? undefined : "");
  }
}

function hasValue(props: any) {
  return isCheckedInputType(props.type) ? "checked" in props : "value" in props;
}
function hasInitialValue(props: any) {
  return (
    hasValue(props) ||
    (isCheckedInputType(props.type)
      ? "initialChecked" in props
      : "initialValue" in props)
  );
}

export function useInput<ValueType, CompType>(
  props: InputProps<ValueType, CompType>
) {
  const {
    type,
    prop,
    value: externalValue,
    initialValue = externalValue,
    clean = false,
    checked,
    initialChecked = checked
  } = props;
  const path = usePath(prop);
  const form = useForm();
  const p = Path.toString(path);

  const isCheckedType = isCheckedInputType(type);

  const externalFormValue = isCheckedType ? checked : externalValue;

  const valueInForm = useSelectable(form, (state) => get(state, path)) || "";

  function onChangeHandler(value: ValueType) {
    /* Get the object identity before change */
    const prev = form.state;

    /* Apply the new value to state  */
    form.set((state) => {
      set(state, path, value, clean);
    });

    /* Track dirty state of fields */
    if (form.state !== prev) {
      form.set((state) => {
        if (!get(state.meta, [p, "dirty"])) {
          set(state.meta, [p, "dirty"], true);
        }
      });
    }
  }

  useLayoutEffect(() => {
    form.set((state) => {
      set(state.meta, [p, "dirty"], false);
    });
  }, [valueInForm, form, p]);

  /* Update the form to the initial value when the field changes:
    - path
    - form parent
    - clean status
   */
  const initialValueRef = useRef(isCheckedType ? initialChecked : initialValue);
  useLayoutEffect(() => {
    if (hasInitialValue(props)) {
      const initialValue = initialValueRef.current;
      form.set((state) => {
        set(
          state,
          path,
          clean ? initialValue || undefined : initialValue,
          clean
        );
      });
    }
    /* 
    We don't want to rerun this hook when clean changes 
    because that would unintentionally reset the users value 
    */
    // eslint-disable-next-line
  }, [form, path]);

  const hasExternValue = hasValue(props);

  useLayoutEffect(() => {
    if (hasExternValue) {
      form.set((state) => {
        set(state, path, externalFormValue, clean);
      });
    }

    /* 
    We don't want to rerun this hook when clean changes 
    because that would unintentionally reset the users value 
    */
    // eslint-disable-next-line
  }, [externalFormValue, path, form, hasExternValue]);

  /* Just run clean again when it is toggled */
  useLayoutEffect(() => {
    form.set((state) => {
      set(state, path, get(state, path), clean);
    });
  }, [form, path, clean]);

  useEffect(() => {
    return () => {
      form.set((state) => {
        const p = Path.toString(path);
        if (clean) {
          del(state.meta, [p], clean);
          del(state, path, clean);
        }
      });
    };
    // eslint-disable-next-line
  }, [path, form]);

  const elementProps = {
    value: valueInForm,
    onChange: onChangeHandler,
    name: Path.toString(path),
    onFocus: () => {
      form.set((state) => {
        set(state.meta, [Path.toString(path), "focus"], true);
      });
    },
    onBlur: () => {
      form.set((state) => {
        set(state.meta, [Path.toString(path), "focus"], false);
        set(state.meta, [Path.toString(path), "dirty"], true);
      });
    }
  };

  return elementProps;
}

export function Input<ValueType, CompType extends InputComponents<ValueType>>({
  as: Component = "input",
  type = "text",
  prop,
  children,
  ...rest
}: InputProps<ValueType, CompType>) {
  const path = usePath(prop);
  const { onChange, ...props } = useInput<ValueType, CompType>({
    as: Component,
    prop,
    value: type === "checkbox" ? rest.checked : rest.value
  });

  function onComponentChange(event: any) {
    const isHTMLElement = typeof Component === "string";
    const valueProp = isCheckedInputType(type) ? "checked" : "value";
    const value = isHTMLElement ? event.target[valueProp] : event;
    onChange(formatValue(value, type, rest.clean, rest.value));
  }

  return (
    <PathContext.Provider value={path}>
      <Component
        {...rest}
        {...props}
        type={type}
        onChange={onComponentChange}
      />
      {children}
    </PathContext.Provider>
  );
}
