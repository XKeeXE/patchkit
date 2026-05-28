import { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useToast, ToastRenderer } from "@patch-kit/toast";
import type { ToastItemProps, ToastPlacement } from "@patch-kit/toast";

type TypeConfig = { type: string; color: string };

type StoryArgs = {
  message: string;
  types: TypeConfig[];
  placement: ToastPlacement;
  offset: number;
  duration: number;
  limit: number;
};

const meta: Meta<StoryArgs> = {
  title: "TOAST",
  args: {
    message: "Toast powered by the Toast Engine.",
    types: [
      { type: "info",    color: "#6c5ce7" },
      { type: "success", color: "#00b894" },
      { type: "warning", color: "#f39c12" },
      { type: "error",   color: "#e17055" },
    ],
    placement: "bottom-right",
    offset: 16,
    duration: 4000,
  },
  argTypes: {
    message: { control: "text" },
    types: {
      control: "object",
      description: "Array of { type, color } pairs. Drives both the trigger buttons and the toast accent color.",
    },
    placement: {
      control: { type: "select" },
      options: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"],
    },
    offset: { control: { type: "range", min: 0, max: 64, step: 4 } },
    duration: {
      control: { type: "select" },
      options: [1000, 2000, 3000, 4000, 5000],
    },
    limit: {
      control: { type: "range", min: 0, max: 32, step: 1 },
      description: "0 = no limit.",
    }
  },
};

export default meta;

const Trigger = (args: StoryArgs) => {
  const { toast } = useToast<string>();

  const ToastComponent = useMemo(() => {
    const colorMap = Object.fromEntries(
      args.types.map(({ type, color }) => [type, color]),
    );

    return function MyToast({ content, type, closeToast }: ToastItemProps<string>) {
      const color = colorMap[type] ?? "#888";
      return (
        <div
          className="flex items-center gap-3 bg-white border border-zinc-200 rounded-lg py-2.5 px-3.5 min-w-65 max-w-100 shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-[13px] text-zinc-700"
          style={{ borderLeft: `3px solid ${color}` }}
        >
          <span className="flex-1 leading-[1.4]">{content}</span>
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.5px]"
            style={{ color }}
          >
            {type}
          </span>
          <button
            onClick={closeToast}
            aria-label="Dismiss"
            className="flex bg-transparent border-none cursor-pointer text-zinc-400 p-0.5 leading-none text-base"
          >
            ×
          </button>
        </div>
      );
    };
  }, [args.types]);

  return (
    <>
      <ToastRenderer
        component={ToastComponent}
        placement={args.placement}
        offset={args.offset}
        duration={args.duration}
        limit={args.limit || undefined}
      />
      <div className="flex gap-2 flex-wrap">
        {args.types.map(({ type, color }) => (
          <button
            key={type}
            onClick={() => toast(args.message, type)}
            className="py-2 px-4.5 rounded-lg bg-white cursor-pointer text-[13px] font-medium"
            style={{ border: `1px solid ${color}`, color }}
          >
            {type}
          </button>
        ))}
      </div>
    </>
  );
};

export const Default: StoryObj<StoryArgs> = {
  render: (args) => <Trigger {...args} />,
};
