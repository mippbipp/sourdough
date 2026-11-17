// Starter cases for apps/web; replace them with what users do.
//   bunx strobe bench perf/smoke.bench.ts --head . --check              each case once: does it work?
//   bunx strobe bench perf/smoke.bench.ts --base origin/main --head .   did this branch change it? (timed)
import { bench, web } from "@hona/strobe";

export default bench({
  // apps/web's production build, served by `vite preview` as strobe.json's `serve` says.
  cases: {
    // The first load in a fresh browser profile until something in the page shows.
    load: { launch: { until: "body *" }, primary: "launch.ready" },
    // The page left open for a second: main-thread work while nothing happens.
    idle: { primary: "main.work", run: ({ page }) => page.wait(1000) },
  },
  targets: { app: web({ url: "/" }) },
});
