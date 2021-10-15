import { useSelectable } from "@selkt/react";
import { getFormErrors, useForm } from "./form";

export function useSubmitEnabled() {
  const form = useForm();
  // Rerender when meta changes
  useSelectable(form, (state) => state.meta);
  const errorState = getFormErrors(form.state);

  return !errorState.count;
}
