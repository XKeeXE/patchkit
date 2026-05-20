"use client";

import { useEffect, useRef } from "react";
import { ModalConfig } from "./useModal";

interface ModalProps {
  modal: ModalConfig;
  index: number;
  isTopModal: boolean;
  inert: boolean;
  className?: string;
  onClose: (id?: string) => void;
}

const Modal = ({
  modal,
  index,
  isTopModal,
  inert,
  onClose,
}: ModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayZIndex = 1100 + index * 2;
  const dialogZIndex = overlayZIndex + 1;

  useEffect(() => {
    if (isTopModal) {
      contentRef.current?.focus();
    }
  }, [isTopModal]);

  return (
    <div
      data-id={modal.id}
      tabIndex={-1}
      style={{
        zIndex: overlayZIndex,
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      role="dialog"
      aria-modal="true"
      {...(inert ? { inert: "" } : {})}
    >
      <div
        modal-backdrop=""
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        onClick={() => {
          if (modal.options?.closeOnOutsideClick) {
            onClose?.(modal.id);
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

export default Modal;
export { ModalRenderer } from "./ModalRenderer";
export { useModal } from "./useModal";
