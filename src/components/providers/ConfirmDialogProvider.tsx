"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ConfirmDialogOptions = {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "destructive";
};

type ConfirmDialogFn = (options: ConfirmDialogOptions) => Promise<boolean>;

const ConfirmDialogContext = createContext<ConfirmDialogFn | null>(null);

const defaultOptions: Required<ConfirmDialogOptions> = {
  title: "Please confirm",
  description: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  tone: "default",
};

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(defaultOptions);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const resolveAndClose = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOpen(false);
  }, []);

  const confirm = useCallback<ConfirmDialogFn>(async (nextOptions) => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }

    setOptions({
      ...defaultOptions,
      ...nextOptions,
    });
    setOpen(true);

    return await new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  useEffect(() => {
    return () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
    };
  }, []);

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            resolveAndClose(false);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-md rounded-none border border-[#efcfb2] bg-[#fff8f6] p-0"
        >
          <DialogHeader className="border-b border-[#efcfb2] bg-[#fff1eb] px-5 py-4">
            <DialogTitle className="text-sm font-semibold uppercase tracking-[0.08em] text-[#9d4300]">
              {options.title}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-relaxed text-[#6f5d4f]">
              {options.description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-row justify-end gap-2 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-none border-[#e8ccb3] bg-white px-4 text-xs uppercase tracking-[0.07em] text-[#6f5d4f] hover:bg-[#f8ede2]"
              onClick={() => resolveAndClose(false)}
            >
              {options.cancelText}
            </Button>
            <Button
              type="button"
              className={
                options.tone === "destructive"
                  ? "rounded-none border border-[#a63c2f] bg-[#c94b3c] px-4 text-xs uppercase tracking-[0.07em] text-white hover:bg-[#b94335]"
                  : "rounded-none border border-[#9a3412] bg-[#f97316] px-4 text-xs uppercase tracking-[0.07em] text-white hover:bg-[#de5b15]"
              }
              onClick={() => resolveAndClose(true)}
            >
              {options.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error("useConfirmDialog must be used within a ConfirmDialogProvider.");
  }

  return context;
}
