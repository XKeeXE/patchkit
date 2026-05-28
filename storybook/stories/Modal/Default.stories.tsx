import type { Meta, StoryObj } from "@storybook/react";
import { useModal, ModalOptions } from "@patch-kit/modal";
import { TRIGGER } from "../utils";

const STORY_ONLY_KEYS = new Set(["title", "body", "backdrop"]);

type StoryArgs = Partial<ModalOptions> & {
  title: string;
  body: string;
  backdrop: number;
};

const meta: Meta<StoryArgs> = {
  title: "MODAL",
  args: {
    title: "Modal Engine",
    body: "Modal powered by the Modal Engine. This content can be any ReactNode.",
    closeOnOutsideClick: true,
    disableBackground: true,
    backdrop: 0.1,
  },
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
    backdrop: { control: { type: "range", min: 0, max: 1, step: 0.1 } },
    closeOnOutsideClick: { control: "boolean" },
    disableBackground: { control: "boolean" },
  },
};

export default meta;

function pickOptions(args: StoryArgs): Partial<ModalOptions> {
  return Object.fromEntries(
    Object.entries(args).filter(([k]) => !STORY_ONLY_KEYS.has(k)),
  ) as Partial<ModalOptions>;
}

function Content({ title, body }: { title: string; body: string }) {
  const { closeModal } = useModal();
  return (
    <div className="bg-white rounded-xl py-8 px-10 min-w-85 shadow-[0_8px_32px_rgba(0,0,0,0.18)] flex flex-col gap-4">
      <h2 className="m-0 text-xl">{title}</h2>
      <p className="m-0 text-zinc-500">{body}</p>
      <button
        onClick={() => closeModal()}
        className="self-end py-2 px-5 rounded-lg border-none bg-zinc-900 text-white cursor-pointer hover:bg-zinc-700 transition-colors"
      >
        Close
      </button>
    </div>
  );
}

const Trigger = (args: StoryArgs) => {
  const { showModal } = useModal();
  return (
    <>
      <style>{`[modal-backdrop] { background: rgba(0, 0, 0, ${args.backdrop}); }`}</style>
      <button
        onClick={() =>
          showModal(
            <Content title={args.title} body={args.body} />,
            pickOptions(args),
          )
        }
        className={TRIGGER}
      >
        Open Modal
      </button>
    </>
  );
};

export const Default: StoryObj<StoryArgs> = {
  render: (args) => <Trigger {...args} />,
};
