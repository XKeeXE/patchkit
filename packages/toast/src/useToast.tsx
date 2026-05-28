"use client";

import { ReactNode } from "react";
import { create } from "zustand";

export type ToastPlacement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastOptions {
  duration?: number;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface ToastConfig {
  id: string;
  content: ReactNode;
  type: string;
  options?: ToastOptions;
}

interface ToastStore {
  toasts: ToastConfig[];
  addToast: (config: ToastConfig) => void;
  closeToast: (id: string) => void;
  closeAllToasts: () => void;
}

export const TOAST_DEFAULTS = {
  duration: 4000,
  placement: "bottom-right" as ToastPlacement,
  offset: 16,
};

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `toast-${Math.random().toString(36).slice(2, 10)}`;
};

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  addToast: (config) =>
    set((store) => {
      const index = store.toasts.findIndex((toast) => toast.id === config.id);
      if (index !== -1) {
        const updated = [...store.toasts];
        updated[index] = config;
        return { toasts: updated };
      }
      return { toasts: [...store.toasts, config] };
    }),
  closeToast: (id) => {
    const target = get().toasts.find((toast) => toast.id === id);
    if (!target) return;
    target.options?.onClose?.();
    set((store) => ({ toasts: store.toasts.filter((toast) => toast.id !== id) }));
  },
  closeAllToasts: () => {
    get().toasts.forEach((toast) => toast.options?.onClose?.());
    set({ toasts: [] });
  },
}));

export function useToast<T extends string = string>() {
  const { addToast, closeAllToasts } = useToastStore();

  const toast = (content: ReactNode, type: T, options?: ToastOptions) => {
    addToast({ id: createId(), content, type, options });
    options?.onOpen?.();
  };

  return { toast, closeAllToasts };
}
