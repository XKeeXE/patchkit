"use client";

import type { ReactNode } from "react";
import { create } from "zustand";

export type ModalContent = ReactNode;

interface ModalOptions {
  id?: string;
  closeOnOutsideClick?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  onClose?: () => void;
}

export interface ModalInstance {
  id: string;
  content: ModalContent;
  closeOnOutsideClick: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  onClose?: () => void;
}

interface ModalStore {
  modals: ModalInstance[];
  showModal: (content: ModalContent, options?: ModalOptions) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
}

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
    const closeOnOutsideClick = options?.closeOnOutsideClick ?? true;
    const onClose = options?.onClose ?? (() => void 0);
    const ariaLabel = options?.ariaLabel;
    const ariaDescribedBy = options?.ariaDescribedBy;

    set((state) => {
      const existingIndex = state.modals.findIndex((m) => m.id === id);
      const nextModal: ModalInstance = {
        id,
        content,
        onClose,
        closeOnOutsideClick,
        ariaLabel,
        ariaDescribedBy,
      };

      if (existingIndex !== -1) {
        const updated = [...state.modals];
        updated[existingIndex] = nextModal;
        return { modals: updated };
      }

      return { modals: [...state.modals, nextModal] };
    });

    return id;
  },
  closeModal: (id) => {
    const currentModals = get().modals;
    const target = id
      ? currentModals.find((modal) => modal.id === id)
      : currentModals[currentModals.length - 1];

    if (!target) return;

    target.onClose?.();
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
