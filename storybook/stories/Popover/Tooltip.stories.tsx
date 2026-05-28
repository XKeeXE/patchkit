import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { usePopover } from "@patch-kit/popover";
import {
  StoryArgs,
  sharedArgs,
  sharedArgTypes,
  pickOptions,
} from "./.shared";
import { SHOW, TRIGGER } from "../utils";

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
      className={TRIGGER}
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
