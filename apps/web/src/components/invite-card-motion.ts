import type { Transition } from "motion/react";

export interface InviteCardMotion {
  entrance: { scale: number; transition: Transition; y: number };
  label: { blur: number; transition: Transition; y: number };
}

// Shipped values. The /lab route seeds its DialKit panel from this object,
// so copied DialKit values land here.
export const inviteCardMotion = {
  entrance: {
    scale: 0.95,
    transition: { duration: 0.25, ease: [0.19, 1, 0.22, 1] },
    y: 8,
  },
  label: {
    blur: 2,
    transition: { bounce: 0, type: "spring", visualDuration: 0.3 },
    y: 12,
  },
} as const satisfies InviteCardMotion;
