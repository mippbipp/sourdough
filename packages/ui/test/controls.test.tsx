import { Button } from "@sourdough/ui/components/button";
import { Checkbox } from "@sourdough/ui/components/checkbox";
import { Input } from "@sourdough/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@sourdough/ui/components/input-group";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";

function Todo() {
  const [done, setDone] = useState(false);

  return (
    <>
      <Checkbox
        id="todo-1"
        checked={done}
        onCheckedChange={() => setDone((value) => !value)}
      />
      <label htmlFor="todo-1">Water the plants</label>
    </>
  );
}

function NewTodo() {
  const [text, setText] = useState("");

  return (
    <>
      <Input
        aria-label="New task"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <output>{text}</output>
    </>
  );
}

describe("button", () => {
  it("keeps the design system's variant and size classes", () => {
    expect.hasAssertions();

    render(
      <Button variant="ghost" size="icon" aria-label="Delete todo">
        x
      </Button>
    );

    const button = screen.getByRole("button", { name: "Delete todo" });

    expect(button.dataset.slot).toBe("button");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toContain("size-8");
    expect(button.className).toContain("hover:bg-muted");
  });

  it("runs onClick from Enter and Space", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();

    render(<Button onClick={onClick}>Save</Button>);
    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("doesn't submit its form while disabled", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();

    const onSubmit = vi.fn<(event: React.SubmitEvent<HTMLFormElement>) => void>(
      (event) => event.preventDefault()
    );

    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" disabled>
          Add
        </Button>
      </form>
    );

    const button = screen.getByRole("button", { name: "Add" });

    expect(button.getAttribute("disabled")).toBe("");
    expect(button.dataset.disabled).toBe("");

    await user.click(button);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders a link through render", () => {
    expect.hasAssertions();

    render(<Button render={<a href="/docs" aria-label="Docs" />}>Docs</Button>);

    const link = screen.getByRole("link", { name: "Docs" });

    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.className).toContain("bg-primary");
  });
});

describe("checkbox", () => {
  it("is named by an external label, and clicking the label toggles it", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();

    render(<Todo />);

    const checkbox = screen.getByRole("checkbox", { name: "Water the plants" });

    expect(checkbox.getAttribute("aria-checked")).toBe("false");

    await user.click(screen.getByText("Water the plants"));

    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(checkbox.dataset.checked).toBe("");
  });

  it("toggles with Space, and shows the check icon only while checked", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();

    render(<Todo />);

    const checkbox = screen.getByRole("checkbox", { name: "Water the plants" });

    expect(checkbox.querySelector("svg")).toBeNull();

    await user.tab();
    await user.keyboard(" ");

    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(checkbox.querySelector("svg")).not.toBeNull();

    await user.keyboard(" ");

    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("leaves aria-disabled off while enabled", () => {
    expect.hasAssertions();

    render(<Checkbox aria-label="Done" />);

    expect(
      screen
        .getByRole("checkbox", { name: "Done" })
        .getAttribute("aria-disabled")
    ).toBeNull();
  });
});

describe("input", () => {
  it("drives a controlled value from native onChange", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();

    render(<NewTodo />);
    await user.type(screen.getByRole("textbox", { name: "New task" }), "Bake");

    expect(screen.getByRole("status").textContent).toBe("Bake");
  });

  it("keeps the design system's classes and reports data-filled", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();

    render(<Input aria-label="Name" />);

    const input = screen.getByRole("textbox", { name: "Name" });

    expect(input.dataset.slot).toBe("input");
    expect(input.className).toContain("border-input");

    await user.type(input, "a");

    expect(input.dataset.filled).toBe("");
  });

  it("works inside an input group, where the addon focuses it", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();

    render(
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput aria-label="Website" />
      </InputGroup>
    );
    await user.click(screen.getByText("https://"));

    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Website" })
    );
  });
});
