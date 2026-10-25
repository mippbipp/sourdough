import type { Transition } from "motion/react";

export interface InviteCardMotion {
  entrance: { scale: number; y: number; transition: Transition };
  label: { y: number; blur: number; transition: Transition };
}

// Shipped values. The /lab route seeds its DialKit panel from this object,
// so copied DialKit values land here.
export const inviteCardMotion = {
  entrance: {
    scale: 0.95,
    y: 8,
    transition: { duration: 0.25, ease: [0.19, 1, 0.22, 1] },
  },
  label: {
    y: 12,
    blur: 2,
    transition: { type: "spring", visualDuration: 0.3, bounce: 0 },
  },
} as const satisfies InviteCardMotion;
