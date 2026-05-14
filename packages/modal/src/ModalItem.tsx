"use client";

import { useEffect, useRef } from "react";
import type { ModalInstance } from "./useModal";

interface ModalItemProps {
  modal: ModalInstance;
  index: number;
  isTopModal: boolean;
  className?: string;
  onClose: (id: string) => void;
}

export const ModalItem = ({
  modal,
  index,
  isTopModal,
  onClose,
}: ModalItemProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayZIndex = 1100 + index * 2;
  const dialogZIndex = overlayZIndex + 1;

  useEffect(() => {
    if (isTopModal) {
      contentRef.current?.focus();
    }
  }, [isTopModal]);

  useEffect(() => {
    if (!isTopModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const container = contentRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (!activeElement || !container.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTopModal]);

  return (
    <div
      data-id={modal.id}
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: overlayZIndex }}
      role="dialog"
      aria-modal="true"
      aria-label={modal.ariaLabel}
      aria-describedby={modal.ariaDescribedBy}
    >
      <div
        modal-backdrop=""
        className="absolute inset-0"
        onClick={() => {
          if (modal.closeOnOutsideClick) {
            onClose(modal.id);
          }
        }}
      />

      <div
        ref={contentRef}
        tabIndex={-1}
        style={{ zIndex: dialogZIndex, position: "relative", outline: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {modal.content}
      </div>
    </div>
  );
};
