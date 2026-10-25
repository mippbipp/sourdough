import {
  createFileRoute,
  lazyRouteComponent,
  notFound,
} from "@tanstack/react-router";

// The lab page loads DialKit. Production builds compile the import away, so
// DialKit never reaches the deploy output.
export const Route = createFileRoute("/lab")({
  beforeLoad: () => {
    if (import.meta.env.PROD) {
      // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router signals a 404 by throwing notFound()
      throw notFound();
    }
  },
  head: () => ({ meta: [{ title: "Motion lab" }] }),
  component: import.meta.env.DEV
    ? lazyRouteComponent(() => import("../lab/motion-lab"), "MotionLab")
    : undefined,
});
