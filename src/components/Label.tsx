import { ReactNode } from "react";

export function Label(props: { label: ReactNode; children: ReactNode }) {
  const { label, children } = props;
  return (
    <label>
      <div style={{ marginBottom: "0.5em", marginTop: "1.5em" }}>{label}</div>
      {children}
    </label>
  );
}
