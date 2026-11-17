import { recommended } from "@effect/tsgo/oxlint-presets";
import nkzw from "@nkzw/oxlint-config/with-sorting";
import { defineConfig } from "oxlint";

const MANUAL_EFFECT_RUNNER_MESSAGE =
  "Write the test with `it.effect(...)` or `layer(...)(...)` from `@effect/vitest`.";

export default defineConfig({
  categories: {
    correctness: "error",
    nursery: "off",
    pedantic: "warn",
    perf: "error",
    restriction: "warn",
    style: "warn",
    suspicious: "warn",
  },
  env: {
    builtin: true,
  },
  extends: [recommended, nkzw],
  globals: {},
  ignorePatterns: [
    "*.gen.ts",
    "*_generated.ts",
    "_generated",
    // agent tooling dirs (installed skills/hooks) are not application source
    ".agent/**",
    ".agents/**",
    ".claude/**",
    ".codex/**",
    ".continue/**",
    ".cursor/**",
    ".gemini/**",
    ".opencode/**",
    ".pi/**",
    ".roo/**",
    ".windsurf/**",
  ],
  jsPlugins: ["eslint-plugin-turbo", "@shadcn/lint"],
  options: {
    denyWarnings: true,
    typeAware: true,
    typeCheck: true, // not full-tree build typechecking
  },
  overrides: [
    {
      files: ["*.config.ts", "**/env/*.ts", "tools/scripts/**/*.ts"],
      rules: {
        "node/no-process-env": "off",
      },
    },
    {
      // tool config files are plain data; native array methods are fine
      files: ["*.config.ts"],
      rules: {
        "effecttsgo/prefer-effect-array": "off",
      },
    },
    {
      files: ["tools/scripts/**/*.ts"],
      rules: {
        "eslint/no-console": "off",
        "unicorn/no-process-exit": "off",
        // sync IO is idiomatic in one-shot deploy scripts; vitest rules
        // misfire on non-test script files (e.g. top-level console.log)
        "node/no-sync": "off",
        "vitest/require-hook": "off",
        // Effect-flavored spellings of the three rules above: a deploy script
        // that shells out to the Vercel CLI and prints a report is plain Node
        // by design, and wrapping it in Effect Runtime would be ceremony
        "effecttsgo/global-console": "off",
        "effecttsgo/node-builtin-import": "off",
        "effecttsgo/process-env": "off",
        // Plain Node scripts; native array, record, and string methods are fine.
        "effecttsgo/prefer-effect-array": "off",
        "effecttsgo/prefer-effect-record": "off",
        "effecttsgo/prefer-effect-string": "off",
      },
    },
    {
      files: ["apps/web/**/*.ts", "apps/web/**/*.tsx"],
      rules: {
        // React components use native array and string methods.
        "effecttsgo/prefer-effect-array": "off",
        "effecttsgo/prefer-effect-record": "off",
        "effecttsgo/prefer-effect-string": "off",
      },
    },
    {
      files: [
        "**/convex/**/*.ts", // convex
        "**/routes/**/*.tsx", // tanstack router
      ],
      rules: {
        "unicorn/filename-case": ["error", { case: "camelCase" }],
      },
    },
    {
      // Convex invokes handlers through its own client and typechecks them as
      // Promise-returning; a mutation handler cannot return an Effect. Effect
      // reaches Convex as Schema validation inside handlers, not as the
      // handler's own return type.
      files: ["**/convex/**/*.ts"],
      rules: {
        "effecttsgo/async-function": "off",
      },
    },
    {
      // TanStack Router requires the Route object and its component to live
      // in the same module; splitting them fights the framework convention
      files: ["**/routes/**/*.tsx"],
      rules: {
        "react/only-export-components": "off",
        // route loaders and submit handlers are Promise-returning by the
        // router's contract; a route module cannot hand back an Effect
        "effecttsgo/async-function": "off",
      },
    },
    {
      // vendored shadcn primitive: grouping semantics come from the upstream
      // component design; reworking to fieldset/focusable divs would diverge
      // from upstream and change rendering
      files: ["packages/ui/src/components/input-group.tsx"],
      rules: {
        "jsx-a11y/no-noninteractive-element-interactions": "off",
        "jsx-a11y/prefer-tag-over-role": "off",
      },
    },
    {
      // server entrypoints: the top-level runMain launches the process,
      // it is not test setup code, and providing layers there is correct
      files: ["packages/server/src/index.ts", "packages/server/src/bin.ts"],
      rules: {
        "effecttsgo/strict-effect-provide": "off",
        "vitest/require-hook": "off",
      },
    },
    {
      // defineContract, implement and the to* projections are constructors
      // that take a whole definition, not data-first combinators, so a
      // data-last overload has nothing to pipe
      files: ["packages/capability/src/**/*.ts"],
      rules: {
        "effecttsgo/missing-pipeable-signature": "off",
      },
    },
    {
      // Effect.run* and ManagedRuntime.make skip the test runtime's scope,
      // TestClock and layer cleanup; tests use it.effect or layer() from
      // @effect/vitest instead
      files: ["**/*.{test,spec}.{ts,tsx,mts,cts,js,jsx,mjs,cjs}"],
      rules: {
        "eslint/no-restricted-properties": [
          "error",
          ...[
            "runCallback",
            "runCallbackWith",
            "runFork",
            "runForkWith",
            "runPromise",
            "runPromiseExit",
            "runPromiseExitWith",
            "runPromiseWith",
            "runSync",
            "runSyncExit",
            "runSyncExitWith",
            "runSyncWith",
          ].map((property) => ({
            message: MANUAL_EFFECT_RUNNER_MESSAGE,
            object: "Effect",
            property,
          })),
          {
            message: MANUAL_EFFECT_RUNNER_MESSAGE,
            object: "ManagedRuntime",
            property: "make",
          },
        ],
      },
    },
    {
      files: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/test/**/*.ts",
        "**/test/**/*.tsx",
      ],
      rules: {
        // @effect/vitest layer() owns setup and teardown internally
        "vitest/no-importing-vitest-globals": "off",
        // @effect/vitest layer() owns setup and teardown internally
        "vitest/require-hook": "off",
        // Effect-integrated assert replaces expect.hasAssertions.
        "vitest/prefer-expect-assertions": "off",
        // test harnesses provide their layers at the test's own entry point
        "effecttsgo/strict-effect-provide": "off",
        // shared test helpers are plain data functions, so a data-last overload
        // has nothing to dualize
        "effecttsgo/missing-pipeable-signature": "off",
      },
    },
    {
      // React component tests drive the DOM through Testing Library, which is
      // Promise-based; there is no Effect code under test here
      files: ["packages/ui/test/**/*.ts", "packages/ui/test/**/*.tsx"],
      rules: {
        "effecttsgo/async-function": "off",
        "effecttsgo/global-timers": "off",
        "effecttsgo/new-promise": "off",
        "effecttsgo/prefer-effect-array": "off",
        "promise/avoid-new": "off",
        // the default Vitest timeout applies to every test in the package
        "vitest/require-test-timeout": "off",
        // ui-sdk reads this global to turn development warnings into errors
        "eslint/no-underscore-dangle": [
          "error",
          { allow: ["_id", "__UI_SDK_STRICT__"] },
        ],
      },
    },
    {
      files: ["**/*.tsx"],
      rules: {
        "react/jsx-props-no-spreading": "off",
      },
    },
    {
      files: ["packages/ui/src/components/*.tsx"],
      rules: {
        "react/only-export-components": "off",
        // upstream shadcn components use `import * as React`; keeping the
        // upstream form lets registry updates apply cleanly
        "import/no-namespace": "off",
        // components own their appearance and may need structural values
        // such as ring-[3px]; cva() call sites aren't statically resolvable
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
        // Vendored shadcn kit, no Effect code: the Effect boolean rule
        // misreads upstream primitives (render props, DOM handles).
        "effecttsgo/strict-boolean-expressions": "off",
      },
    },
  ],
  plugins: [
    "unicorn",
    "typescript",
    "oxc",
    "eslint",
    "vitest",
    "jsx-a11y",
    "react",
    "node",
    "import",
  ],
  rules: {
    // Maintainers rule aimed at published API stability; these packages are private.
    "effecttsgo/api-stability-leak": "off",
    // --- not applicable in codebase ---
    "import/default": "off",
    "import/namespace": "off",
    "oxc/no-async-await": "off",
    "oxc/no-optional-chaining": "off",
    "oxc/no-rest-spread-properties": "off",
    "react/react-in-jsx-scope": "off",
    "unicorn/throw-new-error": "off", // Effect errors are values (Schema.TaggedError), never thrown

    // --- js plugin preferences ---

    "turbo/no-undeclared-env-vars": [
      "error",
      // Vite's built-in import.meta.env flags are compile-time constants, not env vars
      { allowList: ["^(DEV|PROD|SSR|MODE|BASE_URL)$"] },
    ],

    // --- shadcn design-system rules (https://github.com/shadcn-ui/lint) ---
    // no-raw-colors and no-inline-styles stay enabled inside the component
    // dir too; the other three are off there (see override below)

    "shadcn/no-arbitrary-values": ["error", { allow: ["layout"] }],
    "shadcn/no-inline-styles": "error",
    "shadcn/no-raw-colors": "error",
    "shadcn/no-restyle": ["error", { allow: ["layout"] }],
    // cn-* are shadcn's namespaced customization hooks and toaster is
    // sonner's documented hook; neither is Tailwind CSS, both are upstream
    // boilerplate kept so registry updates apply cleanly
    "shadcn/no-unknown-classes": ["error", { allow: ["cn-*", "toaster"] }],
    "shadcn/require-static-classes": "error",

    // --- builtin plugin preferences ---

    "eslint/capitalized-comments": "off",
    "eslint/class-methods-use-this": "off",
    "eslint/func-names": "off",
    "eslint/func-style": "off",
    "eslint/id-length": "off",
    "eslint/max-classes-per-file": "off",
    "eslint/max-lines": "off",
    "eslint/max-lines-per-function": "off",
    "eslint/max-statements": "off",
    "eslint/new-cap": "off",
    "eslint/no-await-in-loop": "off",
    "eslint/no-duplicate-imports": [
      "error",
      {
        allowSeparateTypeImports: true,
      },
    ],
    "eslint/no-empty-function": "off",
    "eslint/no-inline-comments": "off",
    "eslint/no-magic-numbers": "off",
    "eslint/no-nested-ternary": "off",
    "eslint/no-ternary": "off",
    "eslint/no-undefined": "off",
    "eslint/no-use-before-define": "off",
    "eslint/no-void": "off",
    "eslint/no-warning-comments": [
      "error",
      { terms: ["@nocommit", "fixme", "xxx"] },
    ],
    // oxfmt will sort imports
    // https://github.com/oxc-project/oxc/issues/14253
    // https://github.com/oxc-project/oxc/issues/13610
    "eslint/sort-imports": "off",
    // perfectionist/sort-objects owns key order
    "eslint/sort-keys": "off",
    // one declaration per statement; comma-joined declarations hurt readability
    "eslint/one-var": ["error", "never"],
    // Convex system field; the name is mandated by the backend API
    "eslint/no-underscore-dangle": ["error", { allow: ["_id"] }],

    "import/consistent-type-specifier-style": "off",
    "import/exports-last": "off",
    "import/group-exports": "off",
    "import/max-dependencies": "off",
    "import/no-default-export": "off",
    "import/no-named-export": "off",
    "import/no-nodejs-modules": "off",
    "import/no-relative-parent-imports": "off",
    "import/prefer-default-export": "off",

    "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
    "react/jsx-max-depth": "off",
    "react/no-multi-comp": "off",
    // className/style passthrough is the shadcn composition model used by every
    // component in packages/ui; forbidding it would remove the kit's styling API
    "react/forbid-component-props": "off",
    // no i18n infrastructure in the repo; inline copy is fine until then
    "react/jsx-no-literals": "off",

    "typescript/explicit-function-return-type": "off",
    "typescript/explicit-module-boundary-types": "off",
    "typescript/no-confusing-void-expression": "off",
    "typescript/no-unsafe-type-assertion": "off",
    "typescript/prefer-readonly-parameter-types": "off",
    "typescript/promise-function-async": "off",
    // effecttsgo/strict-boolean-expressions reports the same thing
    "typescript/strict-boolean-expressions": "off",

    "unicorn/no-array-callback-reference": "off",
    "unicorn/no-array-method-this-argument": "off",
    // both misfire on Effect's data-last Arr.forEach / Arr.reduce in pipe()
    "unicorn/no-array-for-each": "off",
    "unicorn/no-array-reduce": "off",

    // effecttsgo/async-function already bans async functions, so the
    // remaining Promise interop (e.g. clipboard in a click handler) has to
    // chain .then()
    "promise/prefer-await-to-then": "off",
    "unicorn/no-nested-ternary": "off",
    "unicorn/no-null": "off",
  },
  settings: {
    "jsx-a11y": {
      attributes: {},
      components: {},
      polymorphicPropName: "as",
    },
    react: {
      formComponents: [],
      linkComponents: [],
    },
    vitest: {
      typecheck: false,
    },
  },
});
