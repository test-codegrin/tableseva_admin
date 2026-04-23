import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

function Loader({
  fullscreen = false,
  message = "Restoring session...",
  className,
}: {
  fullscreen?: boolean;
  message?: string;
  className?: string;
}) {
  if (fullscreen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm",
          className,
        )}
      >
        <Spinner className="size-8 text-primary" />
        <p className="text-sm font-medium text-zinc-500">{message}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-[120px] w-full flex-col items-center justify-center gap-2", className)}>
      <Spinner className="size-6 text-primary" />
      <p className="text-sm text-zinc-400">{message}</p>
    </div>
  );
}

export default Loader;
