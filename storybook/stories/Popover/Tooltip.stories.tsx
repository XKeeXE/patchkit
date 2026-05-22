import React, { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { usePopover } from "@patch-kit/popover";
import {
  StoryArgs,
  sharedArgs,
  sharedArgTypes,
  SHOW,
  pickOptions,
} from "./.shared";

const meta: Meta<StoryArgs> = {
  title: "POPOVER",
  args: sharedArgs,
  argTypes: sharedArgTypes,
};

export default meta;

const Label = ({ message }: { message: string }) => (
  <div className="bg-zinc-900 text-white rounded-lg px-3 py-1.5 text-[13px] whitespace-nowrap">
    {message}
  </div>
);

const Trigger = (args: StoryArgs) => {
  const { showPopover, closePopover } = usePopover();
  const ref = useRef<HTMLButtonElement>(null);
  const id = "tooltip";

  return (
    <button
      ref={ref}
      onMouseEnter={() => {
        showPopover(
          ref.current!.getBoundingClientRect(),
          <Label message={args.message} />,
          {
            id,
            ...pickOptions(args),
          },
        );
      }}
      onMouseLeave={() => closePopover(id)}
      className="px-6 py-2.5 rounded-lg border border-gray-300 cursor-pointer text-[15px] bg-white hover:bg-gray-50 transition-colors"
    >
      Hover me
    </button>
  );
};

export const Tooltip: StoryObj<StoryArgs> = {
  argTypes: {
    message: SHOW,
  },
  render: (args) => <Trigger {...args} />,
};
