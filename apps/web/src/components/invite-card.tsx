import { Button } from "@sourdough/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sourdough/ui/components/card";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { inviteCardMotion, type InviteCardMotion } from "./invite-card-motion";

const COPIED_RESET_MS = 2000;

interface InviteCardProps {
  link: string;
  motionValues?: InviteCardMotion;
}

export function InviteCard({
  link,
  motionValues = inviteCardMotion,
}: InviteCardProps) {
  const [copied, setCopied] = useState(false);
  const { entrance, label } = motionValues;

  useEffect(() => {
    if (!copied) {
      return () => {};
    }

    // oxlint-disable-next-line effecttsgo/global-timers -- the effect cleanup owns this timer
    const timeout = setTimeout(() => setCopied(false), COPIED_RESET_MS);

    return () => clearTimeout(timeout);
  }, [copied]);

  const copyLink = () => {
    void navigator.clipboard.writeText(link).then(
      () => setCopied(true),
      () => toast.error("Couldn't copy the invite link")
    );
  };

  return (
    // "user" keeps opacity and blur but drops movement under reduced motion
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, scale: entrance.scale, y: entrance.y }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={entrance.transition}
      >
        <Card>
          <CardHeader>
            <CardTitle>Invite your team</CardTitle>
            <CardDescription>
              Anyone with this link can join the workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="block truncate font-mono text-muted-foreground">
              {link}
            </code>
          </CardContent>
          <CardFooter>
            <Button
              aria-label="Copy invite link"
              className="relative w-24 overflow-hidden"
              onClick={copyLink}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={copied ? "copied" : "copy"}
                  aria-hidden
                  initial={{
                    opacity: 0,
                    y: -label.y,
                    filter: `blur(${label.blur}px)`,
                  }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    y: label.y,
                    filter: `blur(${label.blur}px)`,
                  }}
                  transition={label.transition}
                >
                  {copied ? "Copied" : "Copy link"}
                </motion.span>
              </AnimatePresence>
            </Button>
            <span className="sr-only" aria-live="polite">
              {copied ? "Invite link copied" : ""}
            </span>
          </CardFooter>
        </Card>
      </motion.div>
    </MotionConfig>
  );
}
