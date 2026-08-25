"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<"button"> & { pendingLabel?: string };

/** Botão de submit que se desabilita sozinho enquanto a action roda. */
export function SubmitButton({
  children,
  className = "",
  pendingLabel,
  disabled,
  ...rest
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`transition disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      {...rest}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
