# Package Guidelines

Patterns and conventions used across all packages in this monorepo.

---

## Package structure

```
packages/my-package/
├── src/                # source files
├── tsup.config.ts      # build config — entry point, output formats (esm + cjs), dts, externals
├── tsconfig.json       # TypeScript config — extends root, targets the src/ folder
├── package.json        # package metadata, exports map, peerDependencies, publishConfig
└── README.md           # install command, minimal usage snippet, available options
```

---

## `tsup.config.ts`

All packages use the same base config. Use `.tsx` as the entry extension when the file contains JSX:

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
});
```

Add `banner: { js: '"use client";' }` for packages with React components (Next.js RSC compatibility). Add peer deps as needed.

---

## `package.json` requirements

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "publishConfig": { "access": "public" },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

- `publishConfig.access: "public"` is required for all scoped `@patch-kit/*` packages.
- Runtime deps that the consumer needs to install go in `peerDependencies`.
- Build-only tools (`tsup`, `typescript`, `@types/*`) go in `devDependencies`.

---

## Storybook stories

Each package with visual output should have stories under `storybook/stories/<PackageName>/`.

**Single variant** — one file is enough:
```
storybook/stories/MyPackage/
└── Default.stories.tsx
```

**Multiple variants** — extract shared code to `.shared.tsx` so all stories share a single source of truth for args, argTypes, and helper components:
```
storybook/stories/MyPackage/
├── .shared.tsx
├── Default.stories.tsx
└── Variant.stories.tsx
```

Each variant must be named what its supposed to do. Example: `ContextMenu.stories.tsx`, `Tooltip.stories.tsx`, etc.

## Meta

```ts
const meta: Meta<StoryArgs> = {
  title: "COMPONENT_NAME",  // always ALL-CAPS
  args: sharedArgs,
  argTypes: sharedArgTypes,
};
export default meta;
```

No `component` field — rendering is handled by the `render` function on each story.

## Internal components

> **Simple interaction pattern: Click button → show UI**
> When the story interaction is just a trigger that opens something, always split into two local components:

Each story defines two local components:

- **`Content`** — the visual content rendered inside the component
- **`Trigger`** — the interactive element that calls the hook

```tsx
const Content = ({ title }: { title: string }) => <div>{title}</div>;

const Trigger = (args: StoryArgs) => {
  const { showModal } = useModal();
  return <button onClick={() => showModal(<Content title={args.title} />, pickOptions(args))}>Open</button>;
};

export const Default: StoryObj<StoryArgs> = {
  render: (args) => <Trigger {...args} />,
};
```

## StoryArgs and pickOptions

Define `StoryArgs` as the package options type unioned with any story-only display fields. Use `STORY_ONLY_KEYS` + `pickOptions` to strip them before passing to the hook. Always filter out `undefined` values to prevent them from overriding package defaults:

```ts
const STORY_ONLY_KEYS = new Set(["message", "items"]);

export function pickOptions(args: StoryArgs): Partial<MyOptions> {
  return Object.fromEntries(
    Object.entries(args).filter(([k, v]) => !STORY_ONLY_KEYS.has(k) && v !== undefined),
  ) as Partial<MyOptions>;
}
```

Adding a new `MyOptions` field requires zero changes to `pickOptions`.

> **Multi-variant only.** `HIDDEN`/`SHOW` only applies when using `.shared.tsx`. Single-variant stories have no reason to hide controls — just define everything in `argTypes` directly.

When variants share args but only some variants need a specific field (e.g. `message` is relevant to `Tooltip` but not to `Dropdown`), hide it by default in `sharedArgTypes` and reveal it per-story:

```ts
export const HIDDEN = { table: { disable: true } } as const;
export const SHOW   = { table: { disable: false } } as const;

// .shared.tsx — hidden by default
export const sharedArgTypes = {
  message: { control: "text", ...HIDDEN },
};

// Tooltip.stories.tsx — this variant needs it, so reveal it
export const Tooltip: StoryObj<StoryArgs> = {
  argTypes: { message: SHOW },
  render: (args) => <Trigger {...args} />,
};
```

---

## Publishing

Bumping the `version` field in `package.json` and pushing to `main` is all that's needed. The CI workflow builds all packages and publishes any version not yet on npm.

- Patch (`1.0.0` → `1.0.1`): bug fixes or code organization
- Minor (`1.0.0` → `1.1.0`): new options or features
- Major (`1.0.0` → `2.0.0`): breaking API changes

---

## Github Commits

Commit messages should reference the package they relate:

`(popover)`: Added new placements
`(modal)`: Fixed bug
`(storybook)`: update popover examples
`(virtualized-list)`: Fixed small bug related to drag-and-drop

Use `(storybook)` for story-only changes. Omit the scope only for repo-wide changes.