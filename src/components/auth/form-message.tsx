import { cn } from "@/lib/utils";

export function FormMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const message = error ?? success;
  if (!message) return null;

  return (
    <p
      role={error ? "alert" : "status"}
      className={cn(
        "rounded-lg px-3 py-2 text-[13px] font-medium",
        error
          ? "bg-destructive/10 text-destructive"
          : "bg-accent text-accent-foreground"
      )}
    >
      {message}
    </p>
  );
}
