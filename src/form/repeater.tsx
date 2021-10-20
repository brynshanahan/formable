import { useSelectable } from "@selkt/react";
import {
  Children,
  cloneElement,
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useMemo
} from "react";
import { useForm } from "./form";
import { FormGroup } from "./group";
import { usePath } from "./path";
import { InputProps } from "./types";
import { get, set } from "./utils/obj/get-set/get-set";
import { renderChildren } from "./utils/renderChildren";

const RepeaterItemContext = createContext<{
  index: number;
  onRemove: () => any;
}>({ index: 0, onRemove: () => {} });

const RepeaterCtx = createContext<{ onAdd(value?: any, index?: number): any }>({
  onAdd(value: any, index?: number) {}
});

export function Repeater<T extends any = any>(
  props: InputProps<T[]> & {
    after?: ReactNode;
    before?: ReactNode;
    children: ReactNode | ((value: T, i: number, arr: T[]) => ReactNode);
    getId?: (value: T) => string;
  }
) {
  const { children, getId, prop, after, before } = props;
  const form = useForm();
  const path = usePath(prop);
  const value = useSelectable(form, (state) => get(state, path) as any[]) || [];

  const apis = useMemo(() => {
    let result: any[] = [];
    for (let index = 0; index < value.length; index++) {
      result.push({
        index,
        onRemove() {
          form.set((state) => {
            let val = (get(state, path) as any[]) || [];
            val.splice(index, 1);
            set(state, path, val);
          });
        }
      });
    }
    return result;
    // eslint-disable-next-line
  }, [value?.length, path, form]);

  const repeaterApi = useMemo(() => {
    return {
      onAdd(value?: any, index?: number) {
        form.set((state) => {
          let val = Array.from((get(state, path) as any[]) || []);
          let targetIndex = index === undefined ? val.length : index;
          val.splice(targetIndex, 0, value);
          set(state, path, val);
        });
      }
    };
  }, [path, form]);

  let items = [];

  for (let i = 0; i < value.length; i++) {
    const val = value[i];
    const id = getId ? getId(val) ?? i : i;

    items.push(
      <RepeaterItemContext.Provider value={apis[i]} key={id}>
        <FormGroup prop={i}>
          {renderChildren(children, val, i, value)}
        </FormGroup>
      </RepeaterItemContext.Provider>
    );
  }

  return (
    <RepeaterCtx.Provider value={repeaterApi}>
      <FormGroup prop={prop}>
        {before}
        {items}
        {after}
      </FormGroup>
    </RepeaterCtx.Provider>
  );
}

export function RemoveRepeaterItem(props: { children: ReactElement }) {
  const { children } = props;
  const child = Children.only(children);
  const api = useContext(RepeaterItemContext);
  return cloneElement(child, {
    onClick: (e: any) => {
      e.preventDefault();
      api.onRemove();
      child.props.onClick?.(e);
    }
  });
}

export function AddRepeaterItem(props: {
  children: ReactElement;
  initialValue: { [k: string]: any };
}) {
  const { children, initialValue } = props;
  const child = Children.only(children);
  const api = useContext(RepeaterCtx);
  return cloneElement(child, {
    onClick: (e: any) => {
      e.preventDefault();
      api.onAdd(initialValue);
      child.props.onClick?.(e);
    }
  });
}
