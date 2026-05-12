"use client";

import { useEffect, useRef, useState } from "react";
import type { ModalInstance } from "./useModal";

interface ModalItemProps {
  modal: ModalInstance;
  index: number;
  isTopModal: boolean;
  className?: string;
  onClose: (id: string) => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const ModalItem = ({
  modal,
  index,
  isTopModal,
  className,
  onClose,
  ariaLabel,
  ariaDescribedBy,
}: ModalItemProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayZIndex = 1100 + index * 2;
  const dialogZIndex = overlayZIndex + 1;
  const animationDuration = modal.animationDuration ?? 0;
  const shouldAnimate = animationDuration > 0;
  const [isOpen, setIsOpen] = useState(!shouldAnimate);

  // Auto-focus this modal when it becomes the top modal
  useEffect(() => {
    if (isTopModal) {
      contentRef.current?.focus();
    }
  }, [isTopModal]);

  useEffect(() => {
    if (!shouldAnimate) return;
    const frame = window.requestAnimationFrame(() => setIsOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [shouldAnimate]);

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

  const overlayOpacityClass =
    isOpen && !modal.isClosing ? "opacity-100" : "opacity-0";
  const dialogStateClass =
    isOpen && !modal.isClosing ? "opacity-100 scale-100" : "opacity-0 scale-95";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: overlayZIndex }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${overlayOpacityClass}`}
        style={{ transitionDuration: `${animationDuration}ms` }}
        onClick={() => {
          if (modal.closeOnOutsideClick) {
            onClose(modal.id);
          }
        }}
      />

      {/* Content Wrapper */}
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-xl bg-white p-6 shadow-2xl transition-opacity transition-transform focus:outline-none ${dialogStateClass} ${
          className ?? ""
        }`}
        style={{
          zIndex: dialogZIndex,
          transitionDuration: `${animationDuration}ms`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {modal.content}
      </div>
    </div>
  );
};
