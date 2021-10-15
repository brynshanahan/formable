import { FC, HTMLAttributes } from "react";
import type { MutableSelectable, Selectable } from "@selkt/core";

export type AnySelectable<T> = MutableSelectable<T> | Selectable<T>;

export type InputElements = "input" | "select" | "textarea";
export type InputTypes =
  | "input"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  | "reset"
  | "search"
  | "submit"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";
export type InputComponents<ValueType> =
  | InputElements
  | FC<{ onChange: OnChangeHandler<ValueType>; value: ValueType }>;

export type OnChangeHandler<T = any> = (newValue: T) => any;

export type InputProps<
  ValueType = any,
  CompType extends InputComponents<ValueType> = any
> = {
  prop: string;
  as?: CompType;
  type?: InputTypes;
  onChange?: OnChangeHandler<ValueType>;
  value?: ValueType;
  initialValue?: ValueType;
  checked?: boolean;
  initialChecked?: boolean;
  clean?: boolean;
} & HTMLAttributes<CompType>;
