import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useModal } from "@patch-kit/modal";

/* ---------- A minimal styled modal for demo purposes ---------- */
function DemoModal({ title, body }: { title: string; body: string }) {
  const { closeModal } = useModal();
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "32px 40px",
        minWidth: 340,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
      <p style={{ margin: 0, color: "#555" }}>{body}</p>
      <button
        onClick={() => closeModal()}
        style={{
          alignSelf: "flex-end",
          padding: "8px 20px",
          borderRadius: 8,
          border: "none",
          background: "#111",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  );
}

/* ---------- Trigger button stories wrap ---------- */
function Modal({
  title,
  body,
  closeOnOutsideClick,
  backdropColor,
  backdropBlur,
}: {
  title: string;
  body: string;
  closeOnOutsideClick: boolean;
  backdropColor: string;
  backdropBlur: number;
}) {
  const { showModal } = useModal();
  return (
    <>
      <style>{`[modal-backdrop] { background: ${backdropColor}; backdrop-filter: blur(${backdropBlur}px); }`}</style>
      <button
        onClick={() =>
          showModal(<DemoModal title={title} body={body} />, {
            closeOnOutsideClick,
            ariaLabel: title,
          })
        }
        style={{
          padding: "10px 24px",
          borderRadius: 8,
          border: "1px solid #ccc",
          cursor: "pointer",
          fontSize: 15,
        }}
      >
        Open Modal
      </button>
    </>
  );
}

const meta: Meta<typeof Modal> = {
  title: "modal/Modal",
  component: Modal,
  args: {
    title: "Modal Engine",
    body: "This modal is powered by @patch-kit/modal. Fully unstyled — you own the visuals.",
    closeOnOutsideClick: true,
    backdropColor: "rgba(0, 0, 0, 0.45)",
    backdropBlur: 4,
  },
  argTypes: {
    closeOnOutsideClick: { control: "boolean" },
    title: { control: "text" },
    body: { control: "text" },
    backdropColor: { control: "text" },
    backdropBlur: { control: { type: "range", min: 0, max: 20, step: 1 } },
  },
};

export default meta;

export const Default: StoryObj<typeof Modal> = {};