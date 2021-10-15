import { useSubmitEnabled } from "../form";

export function SubmitButton() {
  const enabled = useSubmitEnabled();
  return (
    <button
      type="submit"
      style={{
        opacity: enabled ? 1 : 0.5
      }}
      disabled={!enabled}
    >
      Submit
    </button>
  );
}
