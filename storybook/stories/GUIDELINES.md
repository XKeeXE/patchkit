# Storybook Story Guidelines

## File structure

```
stories/
  ComponentName/
    .shared.tsx          # shared args, argTypes, primitives (multi-story components only)
    Default.stories.tsx
    Variant.stories.tsx
```

- One directory per component, named in PascalCase.
- Story files are named after the variant they demonstrate (`Default`, `ContextMenu`, `Dropdown`, `Tooltip`).
- When a component has more than one story, extract shared code to `.shared.tsx`. Single-story components keep everything inline.

---

## Meta

```ts
const meta: Meta<StoryArgs> = {
  title: "COMPONENT_NAME",   // always ALL-CAPS
  args: { ... },
  argTypes: { ... },
};

export default meta;
```

- `title` is always uppercase.
- Always typed as `Meta<StoryArgs>`.
- All default values go in `args`; all control definitions go in `argTypes`.
- No `component` field — rendering is handled entirely by the `render` function on each story.

---

## StoryArgs

Define a local `StoryArgs` type that unions the component's option type with any story-only display fields:

```ts
type StoryArgs = Partial<ComponentOptions> & {
  title: string;   // story-only: not passed to the component
  body: string;    // story-only: not passed to the component
};
```

### Filtering story-only keys

Declare a `STORY_ONLY_KEYS` set and a `pickOptions` function to strip them before passing args to the component API:

```ts
const STORY_ONLY_KEYS = new Set(["title", "body"]);

function pickOptions(args: StoryArgs): Partial<ComponentOptions> {
  return Object.fromEntries(
    Object.entries(args).filter(([k]) => !STORY_ONLY_KEYS.has(k)),
  ) as Partial<ComponentOptions>;
}
```

This means adding a new `ComponentOptions` field requires zero changes to `pickOptions`.

---

## Internal components

Each story file defines two local components — never exported, never reused across stories:

| Name | Role |
|---|---|
| `Content` | The visual content rendered inside |
| `Trigger` | The interactive element (button, area) that fires the component |

```ts
const Content = ({ title, body }: { ... }) => { ... };

const Trigger = (args: StoryArgs) => {
  const { showModal } = useModal();
  return <button onClick={() => showModal(<Content ... />, pickOptions(args))}>...</button>;
};
```

- `Content` receives only the data it needs as explicit props.
- `Trigger` receives the full `args` object and is responsible for calling the hook and forwarding options.

---

## Story exports

```ts
export const Default: StoryObj<StoryArgs> = {
  render: (args) => <Trigger {...args} />,
};
```

- Always `StoryObj<StoryArgs>`.
- Always uses `render: (args) => <Trigger {...args} />` — never the `component` shorthand.
- The export name matches the file name (`Default.stories.tsx` → `export const Default`).

---

## argTypes controls

| Data type | Control |
|---|---|
| string | `{ control: "text" }` |
| boolean | `{ control: "boolean" }` |
| number (continuous) | `{ control: { type: "range", min, max, step } }` |
| enum / fixed set | `{ control: { type: "select" }, options: [...] }` |
| array / object | `{ control: "object" }` |

Add a `description` to argTypes entries when the semantics aren't obvious from the field name (e.g., `"0 = no limit."`, `"undefined = disabled."`).

---

## Shared files (`.shared.tsx`)

Used when multiple stories belong to the same component group (same `title`). Export:

- Shared UI primitives (`Panel`, `MenuItem`, etc.)
- `StoryArgs` type and `DropdownItem` / similar data types
- `STORY_ONLY_KEYS`, `pickOptions`
- `sharedArgs` and `sharedArgTypes`
- Visibility helpers: `HIDDEN` and `SHOW`

```ts
export const HIDDEN = { table: { disable: true } } as const;
export const SHOW   = { table: { disable: false } } as const;
```

Story-only args are hidden in the controls table by default (using `HIDDEN` in `sharedArgTypes`). Each story opts specific fields back in via `argTypes` overrides at the story level:

```ts
export const Default: StoryObj<StoryArgs> = {
  argTypes: { message: SHOW },
  render: (args) => <Trigger {...args} />,
};
```

---

## Styling

- Tailwind CSS throughout; no inline style objects except for dynamic values (e.g., `style={{ color }}`).
- Consistent trigger button shape: `px-6 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-[15px] cursor-pointer`.
- Consistent panel/card shape: `bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)]`.
- Font size for dense UI (menus, toasts): `text-[13px]`.