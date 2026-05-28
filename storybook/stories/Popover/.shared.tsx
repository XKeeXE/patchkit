import React from "react";
import type { ArgTypes } from "@storybook/react";
import type { PopoverOptions } from "@patch-kit/popover";
import { HIDDEN } from "../utils";

export const Panel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] text-sm text-zinc-700 ${
      className ?? ""
    }`}
  >
    {children}
  </div>
);

export const MenuItem = ({
  label,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  label: string;
  onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => (
  <button
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
    className="flex justify-between w-full py-1.75 px-3.5 border-none bg-transparent hover:bg-zinc-100 text-left cursor-pointer text-[13px] text-zinc-700 rounded transition-colors"
  >
    {label}
  </button>
);

export type DropdownItem = { label: string; submenu?: true } | null;

// Story-specific keys that are not PopoverOptions
const STORY_ONLY_KEYS = new Set([
  "message",
  "contextItems",
  "dropdownItems",
  "submenuItems",
]);

export type StoryArgs = Partial<PopoverOptions> & {
  message: string;
  contextItems: (string | null)[];
  dropdownItems: DropdownItem[];
  submenuItems: string[];
};

// Strips story-only keys, leaving only PopoverOptions fields.
// Adding a new PopoverOptions field requires zero changes here.
export function pickOptions(args: StoryArgs): Partial<PopoverOptions> {
  return Object.fromEntries(
    Object.entries(args).filter(([k]) => !STORY_ONLY_KEYS.has(k)),
  ) as Partial<PopoverOptions>;
}

export const sharedArgs: StoryArgs = {
  message: "Popover powered by the Popover Engine.",
  placement: "bottom",
  gap: 4,
  closeOnOutsideClick: true,
  toggable: false,
  contextItems: ["Cut", "Copy", "Paste", null, "Select All", "Delete"],
  dropdownItems: [
    { label: "Profile" },
    { label: "Settings" },
    { label: "More options →", submenu: true },
    null,
    { label: "Sign out" },
  ],
  submenuItems: ["Option A", "Option B", "Option C"],
};


// PopoverOptions fields are always visible.
// Story-specific fields are hidden by default — use SHOW in a story's argTypes to expose one.
// Add a control entry here when you add a new configurable field to PopoverOptions.
export const sharedArgTypes: Partial<ArgTypes<StoryArgs>> = {
  message: { control: "text", ...HIDDEN },
  placement: {
    control: { type: "select" },
    options: ["bottom", "top", "left", "right", "bottom-left", "bottom-right", "top-left", "top-right"],
  },
  gap: { control: { type: "range", min: 0, max: 40, step: 1 } },
  closeOnOutsideClick: { control: "boolean" },
  toggable: { control: "boolean" },
  autoCloseDelay: {
    control: "select",
    options: [undefined, 0, 100, 200, 500],
    description:
      "undefined = disabled. 0 = close immediately on leave. Any number = ms delay.",
  },
  contextItems: {
    control: "object",
    description: "Menu items. Use null for a divider.",
    ...HIDDEN,
  },
  dropdownItems: {
    control: "object",
    description:
      "Menu items. Use { label, submenu: true } for submenu triggers, null for dividers.",
    ...HIDDEN,
  },
  submenuItems: {
    control: "object",
    description: "Labels for the nested submenu.",
    ...HIDDEN,
  },
};
