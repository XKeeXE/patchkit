"use client";

import type { ReactNode } from "react";
import { create } from "zustand";


export interface ModalConfig {
  id: string;
  content: ReactNode;
  options?: {
    closeOnOutsideClick?: boolean;
    disableBackground?: boolean;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    onOpen?: () => void;
    onClose?: () => void;
  }
}

type ModalOptions = NonNullable<ModalConfig["options"]> & { id?: string };

interface ModalStore {
  modals: ModalConfig[];
  showModal: (content: ReactNode, options?: ModalOptions) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
}

const MODAL_DEFAULTS: ModalConfig["options"] = {
  closeOnOutsideClick: true,
  disableBackground: true,
};

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `modal-${Math.random().toString(36).slice(2, 10)}`;
};

export const useModalStore = create<ModalStore>((set, get) => ({
  modals: [],
  showModal: (content, options) => {
    const id = options?.id ?? createId();
    const resolved: ModalConfig = {
      id,
      content,
      options: {
        ...MODAL_DEFAULTS,
        ...options,
      },
    };

    set((state) => {
      const existingIndex = state.modals.findIndex((m) => m.id === id);
      if (existingIndex !== -1) {
        const updated = [...state.modals];
        updated[existingIndex] = resolved;
        return { modals: updated };
      }
      return { modals: [...state.modals, resolved] };
    });

    resolved.options?.onOpen?.();
    return id;
  },
  closeModal: (id) => {
    const currentModals = get().modals;
    const target = id
      ? currentModals.find((modal) => modal.id === id)
      : currentModals[currentModals.length - 1];

    if (!target) return;

    target.options?.onClose?.();
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== target.id),
    }));
  },
  closeAllModals: () => {
    const currentModals = get().modals;
    currentModals.forEach((modal) => {
      get().closeModal(modal.id);
    });
  },
}));

export const useModal = () => {
  const { showModal, closeModal, closeAllModals } = useModalStore();
  return { showModal, closeModal, closeAllModals };
};
