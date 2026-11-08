import { definePlugin, defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";

// Adapted from rat-stack (MIT, Joel Hooks):
// https://github.com/joelhooks/rat-stack/blob/main/scripts/oxlint-plugin-effect-tests.ts

const TEST_FILE_PATTERN = /\.(?:test|spec)\.[cm]?[jt]sx?$/u;

const EFFECT_RUNNERS = new Set([
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
]);

const isManualRunner = (callee: ESTree.Node): boolean => {
  if (
    callee.type !== "MemberExpression" ||
    callee.object.type !== "Identifier" ||
    callee.property.type !== "Identifier"
  ) {
    return false;
  }

  const object = callee.object.name;
  const method = callee.property.name;

  return (
    (object === "Effect" && EFFECT_RUNNERS.has(method)) ||
    (object === "ManagedRuntime" && method === "make")
  );
};

const noManualEffectRuntimeInTests = defineRule({
  create(context) {
    if (!TEST_FILE_PATTERN.test(context.filename)) {
      return {};
    }

    return {
      CallExpression(node) {
        if (isManualRunner(node.callee)) {
          context.report({ messageId: "manualRunner", node: node.callee });
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Disallow running Effects by hand in tests; use @effect/vitest.",
    },
    messages: {
      manualRunner:
        "Tests must not run Effects by hand. Effect.run* and ManagedRuntime.make skip the test runtime's scope, TestClock and layer cleanup. Write the test with `it.effect(...)` or `layer(...)(...)` from `@effect/vitest`.",
    },
    type: "problem",
  },
});

export default definePlugin({
  meta: { name: "effect-tests" },
  rules: { "no-manual-effect-runtime-in-tests": noManualEffectRuntimeInTests },
});
