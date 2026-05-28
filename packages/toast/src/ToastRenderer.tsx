"use client";

import { ComponentType, CSSProperties, ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TOAST_DEFAULTS, ToastOptions, ToastPlacement, useToastStore } from "./useToast";
import ToastItem from "./";

export interface ToastItemProps<T extends string = string> {
  content: ReactNode;
  type: T;
  closeToast: () => void;
}

interface ToastRendererProps<T extends string = string> extends ToastOptions {
  component: ComponentType<ToastItemProps<T>>;
  placement?: ToastPlacement;
  offset?: number;
  limit?: number;
}

function getContainerStyle(placement: ToastPlacement, offset: number): CSSProperties {
  const style: CSSProperties = {
    position: "fixed",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 9999,
    pointerEvents: "none",
  };

  if (placement.startsWith("top")) style.top = offset;
  else style.bottom = offset;

  if (placement.endsWith("left")) style.left = offset;
  else if (placement.endsWith("right")) style.right = offset;
  else {
    style.left = "50%";
    style.transform = "translateX(-50%)";
  }

  return style;
}

export function ToastRenderer<T extends string = string>({
  component,
  placement = TOAST_DEFAULTS.placement,
  offset = TOAST_DEFAULTS.offset,
  duration = TOAST_DEFAULTS.duration,
  limit,
  onOpen,
  onClose,
}: ToastRendererProps<T>) {
  const toasts = useToastStore((store) => store.toasts);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (limit === undefined) return;
    const excess = toasts.slice(0, Math.max(0, toasts.length - limit));
    excess.forEach((toast) => useToastStore.getState().closeToast(toast.id));
  }, [toasts.length, limit]);

  if (!isClient) return null;

  return createPortal(
    <div
      style={getContainerStyle(placement, offset)}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem<T>
          key={toast.id}
          config={toast}
          component={component}
          duration={duration}
          onOpen={onOpen}
          onClose={onClose}
        />
      ))}
    </div>,
    document.body
  );
}
