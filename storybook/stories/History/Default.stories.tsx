import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createHistory } from "@patch-kit/history";
import { PANEL } from "../utils";

const { HistoryProvider, useHistory } = createHistory<string>();

type StoryArgs = {
  limit: number;
};

const meta: Meta<StoryArgs> = {
  title: "HISTORY",
  args: {
    limit: 64,
  },
  argTypes: {
    limit: {
      control: { type: "range", min: 1, max: 128, step: 1 },
      description: "Maximum number of undoable steps.",
    },
  },
};

export default meta;

const Content = () => {
  const { addHistory, undo, redo, canUndo, canRedo, resetHistory } = useHistory();
  const [value, setValue] = useState("");
  const prevRef = useRef("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const prev = prevRef.current;
    const next = e.target.value;
    setValue(next);
    addHistory({
      name: "type",
      undo: () => { setValue(prev); prevRef.current = prev; return prev; },
      redo: () => { setValue(next); prevRef.current = next; return next; },
    });
    prevRef.current = next;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    } else if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      redo();
    }
  };

  const btnBase =
    "px-4 py-2 rounded-lg border text-[13px] font-medium cursor-pointer transition-colors";
  const btnEnabled = "border-gray-300 bg-white hover:bg-gray-50 text-gray-700";
  const btnDisabled = "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed";

  return (
    <div className={`flex flex-col gap-4 p-6 ${PANEL} w-96`}>
      <input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-[13px] text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
      />
      <div className="flex gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`${btnBase} ${canUndo ? btnEnabled : btnDisabled}`}
        >
          ← Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`${btnBase} ${canRedo ? btnEnabled : btnDisabled}`}
        >
          Redo →
        </button>
        <button
          onClick={resetHistory}
          className={`${btnBase} ${btnEnabled} ml-auto`}
        >
          Reset
        </button>
      </div>
      <p className="text-[11px] text-gray-400 text-center">
        ⌘Z / Ctrl+Z to undo · ⌘⇧Z / Ctrl+Y to redo
      </p>
    </div>
  );
};

const Trigger = (args: StoryArgs) => (
  <HistoryProvider limit={args.limit}>
    <Content />
  </HistoryProvider>
);

export const Default: StoryObj<StoryArgs> = {
  render: (args) => <Trigger {...args} />,
};