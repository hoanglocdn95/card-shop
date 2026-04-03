import { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-(--accent-teal) focus:ring-2 focus:ring-[#d8f3f3]",
        className,
      )}
      {...props}
    />
  );
}
