import { Button } from "@sourdough/ui/components/button";
import { Checkbox } from "@sourdough/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sourdough/ui/components/dropdown-menu";
import { Input } from "@sourdough/ui/components/input";
import { render, screen } from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

type OnAction = (value: string) => void;

type Entry = ReturnType<ReturnType<typeof createAgent>["snapshot"]>[number];

const onPage = (entry: Entry) =>
  entry.offPage !== true && entry.component !== "more";

function TodoRow({ onAction }: { onAction: OnAction }) {
  const [done, setDone] = useState(false);
  const [text, setText] = useState("");

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <Input
        aria-label="New task"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button type="submit">Add task</Button>
      <Checkbox
        id="todo-1"
        checked={done}
        onCheckedChange={() => setDone((value) => !value)}
      />
      <label htmlFor="todo-1">Water the plants</label>
      <DropdownMenu onAction={onAction}>
        <DropdownMenuTrigger aria-label="Actions for Water the plants">
          ...
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem value="delete" variant="destructive">
            Delete forever
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </form>
  );
}

describe("agent bridge", () => {
  it("finds and uses every wrapped control", async () => {
    expect.hasAssertions();

    const agent = createAgent();
    const onAction = vi.fn<OnAction>();

    render(<TodoRow onAction={onAction} />);

    const components = agent.snapshot().filter(onPage);
    const labels = components.map((entry) => entry.label);

    expect(labels).not.toContain(undefined);
    expect(labels).not.toContain("");
    expect(labels).toStrictEqual(
      expect.arrayContaining([
        "New task",
        "Add task",
        "Water the plants",
        "Actions for Water the plants",
      ])
    );

    // "Water the plants" is part of the menu trigger's label too, so the
    // checkbox is addressed by its ref.
    const checkbox = components.find(
      (entry) => entry.label === "Water the plants"
    );

    const result = await agent.act({
      steps: [
        { ref: "New task", action: "setValue", args: ["Bake bread"] },
        { ref: String(checkbox?.ref), action: "toggle" },
        {
          ref: "Actions for Water the plants",
          action: "press",
          args: ["Delete forever"],
        },
      ],
    });

    expect({
      error: result.error,
      task: screen.getByRole<HTMLInputElement>("textbox", { name: "New task" })
        .value,
      checked: screen
        .getByRole("checkbox", { name: "Water the plants" })
        .getAttribute("aria-checked"),
    }).toStrictEqual({ error: undefined, task: "Bake bread", checked: "true" });
    expect(onAction).toHaveBeenCalledWith("delete", expect.anything());
  });
});
