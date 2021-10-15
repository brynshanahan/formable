import { Selectable } from "@selkt/core";
import { useSelectable } from "@selkt/react";
import { useState, useEffect, useMemo } from "react";
import { stringify } from "../utils/stringify";

export function Log<T>({ state }: { state: Selectable<T> }) {
  const currentState = useSelectable(state);
  const [debounceState, setDebounceState] = useState(currentState);

  useEffect(() => {
    let tm = setTimeout(() => {
      setDebounceState(currentState);
    }, 16);
    return () => clearTimeout(tm);
  }, [currentState]);

  const message = useMemo(() => stringify(debounceState), [debounceState]);

  return (
    <pre>
      <code>{message}</code>
    </pre>
  );
}
