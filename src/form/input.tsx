import React, { ChangeEvent, useEffect, useLayoutEffect, useRef } from "react";
import { useSelectable } from "@selkt/react";
import { useForm } from "./form";
import { del, get, push, remove, set } from "./utils/getset";
import { InputComponents, InputProps, InputTypes } from "./types";
import { Path, PathContext, usePath } from "./path";
import { useIdentity } from './hooks/use-identity';
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

export function useInput<ValueType>(
  props: InputProps<ValueType>
) {
  const {
    prop,
    value: externalValue,
    initialValue = externalValue,
    clean = false,
  } = props;

  const identity = useIdentity()
  const path = usePath(prop);
  const form = useForm();
  const p = Path.toString(path);

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
        if (get(state.meta, [p, "dirty"])) {
          set(state.meta, [p, "dirty"], false);
        }
      });
    }
  }

  useEffect(() => {
    form.set((state) => {
      push(state.meta, [p, 'refs'], identity)
      set(state.meta, [p, "dirty"], false);
    });
    return () => {
      console.log('unset', identity)
      form.set((state) => {
        remove(state.meta, [p, 'refs'], identity)
        if (!state.meta[p].refs.length) {
          del(state.meta, [p], clean);
          del(state, path, clean);
        }
      });
    };
  }, [path, form, p]);

  /* Update the form to the initial value when the field changes:
    - path
    - form parent
    - clean status
   */
  const initialValueRef = useRef(initialValue);
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
        set(state, path, externalValue, clean);
      });
    }

    /* 
    We don't want to rerun this hook when clean changes 
    because that would unintentionally reset the users value 
    */
    // eslint-disable-next-line
  }, [externalValue, path, form, hasExternValue]);

  /* Just run clean again when it is toggled */
  useLayoutEffect(() => {
    form.set((state) => {
      set(state, path, get(state, path), clean);
    });
  }, [form, path, clean]);

  const elementProps = {
    value: valueInForm,
    onChange: onChangeHandler,
    name: Path.toString(path),
    onFocus: () => {
      form.set((state) => {
        set(state.meta, [p, "focus"], true);
      });
    },
    onBlur: () => {
      form.set((state) => {
        set(state.meta, [p, "focus"], false);
        set(state.meta, [p, "dirty"], true);
      });
    }
  };

  return elementProps;
}

export function Input<ValueType = string, CompType extends InputComponents<ValueType> = "input">({
  as: Component = "input" as CompType,
  type = "text",
  prop,
  children,
  value,
  clean = false,
  ...rest
}: InputProps<ValueType, CompType>) {
  const path = usePath(prop);
  
  const { onChange, value: formValue, ...props } = useInput<ValueType>({
    as: Component,
    prop,
    value: value
  });

  function onComponentChange(event: any) {
    const isHTMLElement = typeof Component === "string";
    const valueProp = isCheckedInputType(type) ? "checked" : "value";
    const value = isHTMLElement ? event.target[valueProp] : event;
    onChange(formatValue(value, type, clean, value));
  }

  const builtProps = {} as any

  if (typeof type !== 'function') {
    builtProps.type = type
  }

  if (isCheckedInputType(type)) {
    builtProps.checked = formValue
  } else {
    builtProps.value = formValue
  }

  return (
    <PathContext.Provider value={path}>
      <Component
        {...rest}
        {...props}
        {...builtProps}
        type={type}
        onChange={onComponentChange}
      />
      {children}
    </PathContext.Provider>
  );
}
