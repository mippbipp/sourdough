import { DialRoot, useDialKitController, type TransitionConfig } from "dialkit";
import type { Transition } from "motion/react";
import { useState } from "react";

import { InviteCard } from "../components/invite-card";
import { inviteCardMotion } from "../components/invite-card-motion";

import dialkitCss from "dialkit/styles.css?url";

// DialKit's easing mode reports `type: "easing"`, which Motion does not
// recognize. Springs already use Motion's field names.
function toMotionTransition(transition: TransitionConfig): Transition {
  if (transition.type === "easing") {
    return {
      duration: transition.duration,
      ease: transition.ease,
      type: "tween",
    };
  }

  return transition;
}

export function MotionLab() {
  const [entranceRun, setEntranceRun] = useState(0);
  const { entrance, label } = inviteCardMotion;

  // Defaults come from inviteCardMotion. Apply copied values there, not here.
  const dial = useDialKitController(
    "Invite card",
    {
      entrance: {
        scale: [entrance.scale, 0.85, 1, 0.01],
        transition: {
          duration: entrance.transition.duration,
          ease: [...entrance.transition.ease],
          type: "easing",
        },
        y: [entrance.y, 0, 24, 1],
      },
      label: {
        blur: [label.blur, 0, 8, 0.5],
        transition: {
          bounce: label.transition.bounce,
          type: "spring",
          visualDuration: label.transition.visualDuration,
        },
        y: [label.y, 0, 24, 1],
      },
      replay: { label: "Replay entrance", type: "action" },
      reset: { label: "Reset to code values", type: "action" },
    },
    {
      id: "invite-card",
      onAction: (path) => {
        if (path === "replay") {
          setEntranceRun((run) => run + 1);
        }

        if (path === "reset") {
          dial.resetValues();
        }
      },
      persist: true,
    }
  );

  const tuned = dial.values;

  return (
    <main className="container mx-auto grid max-w-3xl gap-8 px-4 py-10">
      <section className="grid gap-2">
        <h1 className="text-lg font-medium">Motion lab</h1>
        <p className="text-sm text-muted-foreground">
          Dev only. Production builds return 404 here and leave DialKit out.
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Click Copy link to play the label swap. Use Replay entrance in the
            panel to remount the card.
          </li>
          <li>Drag the sliders and the curve until it looks right.</li>
          <li>
            Save a new version from the Versions menu for each candidate, then
            switch between them to compare.
          </li>
          <li>Press Copy in the panel and paste the result to your agent.</li>
          <li>
            Once the values are in invite-card-motion.ts, press Reset to code
            values to confirm the panel matches the code.
          </li>
        </ol>
      </section>

      <div className="mx-auto w-full max-w-sm">
        <InviteCard
          key={entranceRun}
          link="https://example.com/invite/7f3k2q"
          motionValues={{
            entrance: {
              scale: tuned.entrance.scale,
              transition: toMotionTransition(tuned.entrance.transition),
              y: tuned.entrance.y,
            },
            label: {
              blur: tuned.label.blur,
              transition: toMotionTransition(tuned.label.transition),
              y: tuned.label.y,
            },
          }}
        />
      </div>

      {/* React 19 hoists this into <head> */}
      <link href={dialkitCss} precedence="default" rel="stylesheet" />
      <DialRoot theme="dark" />
    </main>
  );
}
