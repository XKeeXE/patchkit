"use client";

import { ComponentType, useEffect } from "react";
import { ToastConfig, useToastStore } from "./useToast";
import { ToastItemProps } from "./ToastRenderer";

interface ToastEntryProps<T extends string = string> {
  config: ToastConfig;
  component: ComponentType<ToastItemProps<T>>;
  duration?: number;
  onOpen?: () => void;
  onClose?: () => void;
}

function ToastItem<T extends string = string>({
  config,
  component: Component,
  duration,
  onOpen,
  onClose,
}: ToastEntryProps<T>) {
  const closeToast = useToastStore((store) => store.closeToast);
  const resolvedDuration =
    config.options && "duration" in config.options
      ? config.options.duration
      : duration;

  const handleClose = () => {
    onClose?.();
    closeToast(config.id);
  };

  useEffect(() => {
    onOpen?.();
    if (resolvedDuration === undefined) return;
    const timer = setTimeout(handleClose, resolvedDuration);
    return () => clearTimeout(timer);
  }, [config.id, resolvedDuration]);

  return (
    <div style={{ pointerEvents: "auto" }}>
      <Component
        content={config.content}
        type={config.type as T}
        closeToast={handleClose}
      />
    </div>
  );
}

export default ToastItem;
export { ToastRenderer } from "./ToastRenderer";
export { useToast } from "./useToast";
export type { ToastOptions, ToastPlacement } from "./useToast";
export type { ToastItemProps } from "./ToastRenderer";
