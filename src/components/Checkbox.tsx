import { Input } from "../form";
import { ReactNode } from "react";

export function Checkbox({
  prop,
  value,
  clean,
  children
}: {
  prop: string;
  value: any;
  clean?: boolean;
  children?: ReactNode;
}) {
  return (
    <label>
      <Input prop={prop} type="checkbox" value={value} clean={clean}>
        {children}
      </Input>
    </label>
  );
}
