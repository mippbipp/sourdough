import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@sourdough/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sourdough/ui/components/tooltip";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { checkPattern } from "@ui-sdk/core/testing";
import { describe, expect, it, vi } from "vitest";

type OnAction = (value: string) => void;

// ui-sdk names a tooltip's trigger and moves focus into an opened menu a
// frame after the event.
const settle = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 0);
        });
      })
  );

function FileMenu({ onAction }: { onAction?: OnAction }) {
  return (
    <DropdownMenu onAction={onAction}>
      <DropdownMenuTrigger>File</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Document</DropdownMenuLabel>
          <DropdownMenuItem value="rename">Rename</DropdownMenuItem>
          <DropdownMenuItem value="delete" variant="destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem value="wrap">
          Word wrap
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup defaultValue="name">
          <DropdownMenuRadioItem value="name">By name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="date">By date</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem value="copy-link">Copy link</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function openFileMenu(onAction?: OnAction) {
  const user = userEvent.setup();

  render(<FileMenu onAction={onAction} />);

  const trigger = screen.getByRole("button", { name: "File" });

  await user.click(trigger);
  await settle();

  return { user, trigger };
}

describe("dropdown menu", () => {
  it("runs onAction on Enter, then closes and returns focus", async () => {
    expect.hasAssertions();

    const onAction = vi.fn<OnAction>();
    const { user, trigger } = await openFileMenu(onAction);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    await user.keyboard("{ArrowDown}{Enter}");

    expect(onAction).toHaveBeenCalledWith("rename", expect.anything());
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("maps the destructive variant to ui-sdk's destructive item", async () => {
    expect.hasAssertions();

    await openFileMenu();

    const remove = screen.getByRole("menuitem", { name: "Delete" });

    expect(remove.dataset.destructive).toBe("");
    expect(remove.className).toContain("data-destructive:text-destructive");
    expect(
      screen.getByRole("menuitem", { name: "Rename" }).dataset.destructive
    ).toBeUndefined();
  });

  it("toggles a checkbox item and shows its check", async () => {
    expect.hasAssertions();

    const { user } = await openFileMenu();
    const wrap = screen.getByRole("menuitemcheckbox", { name: "Word wrap" });

    expect(wrap.querySelector("svg")).toBeNull();

    await user.click(wrap);

    expect(wrap.getAttribute("aria-checked")).toBe("true");
    expect(wrap.querySelector("svg")).not.toBeNull();
  });

  it("selects one radio item at a time", async () => {
    expect.hasAssertions();

    const { user } = await openFileMenu();
    const byDate = screen.getByRole("menuitemradio", { name: "By date" });

    await user.click(byDate);

    expect(byDate.getAttribute("aria-checked")).toBe("true");
    expect(
      screen
        .getByRole("menuitemradio", { name: "By name" })
        .getAttribute("aria-checked")
    ).toBe("false");
  });

  it("opens the submenu with ArrowRight, and Escape returns to its trigger", async () => {
    expect.hasAssertions();

    const { user } = await openFileMenu();

    await user.keyboard("{End}");

    const share = screen.getByRole("menuitem", { name: "Share" });

    await user.keyboard("{ArrowRight}");

    expect(share.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Copy link" })
    );

    await user.keyboard("{Escape}");

    expect(document.activeElement).toBe(share);
    expect(share.getAttribute("aria-expanded")).toBe("false");
  });

  it("follows the WAI-ARIA menu pattern", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Edit</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem value="undo">Undo</DropdownMenuItem>
          <DropdownMenuItem value="redo">Redo</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await settle();

    await expect(
      checkPattern(screen.getByRole("menu"), "menu")
    ).resolves.toBeUndefined();
  });
});

describe("tooltip", () => {
  it("names an icon-only trigger and opens at once on keyboard focus", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();

    render(
      <Tooltip>
        <TooltipTrigger>
          <svg aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent side="bottom">Archive</TooltipContent>
      </Tooltip>
    );
    await settle();
    await user.tab();

    const tooltip = screen.getByRole("tooltip");

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Archive" })
    );
    expect(tooltip.dataset.open).toBe("");
    expect(tooltip.dataset.side).toBe("bottom");
    expect(tooltip.className).toContain("bg-foreground");
    expect(tooltip.querySelector("[data-slot=tooltip-arrow]")).not.toBeNull();
  });

  it("closes on Escape and leaves focus on the trigger", async () => {
    expect.hasAssertions();

    const user = userEvent.setup();

    render(
      <Tooltip>
        <TooltipTrigger>Share</TooltipTrigger>
        <TooltipContent>Anyone with the link can view</TooltipContent>
      </Tooltip>
    );
    await user.tab();
    await user.keyboard("{Escape}");

    expect(
      screen.getByRole("tooltip", { hidden: true }).dataset.open
    ).toBeUndefined();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Share" })
    );
  });

  it("describes a trigger that already has a name", () => {
    expect.hasAssertions();

    render(
      <Tooltip>
        <TooltipTrigger>Share</TooltipTrigger>
        <TooltipContent>Anyone with the link can view</TooltipContent>
      </Tooltip>
    );

    expect(
      screen
        .getByRole("button", { name: "Share" })
        .getAttribute("aria-describedby")
    ).toBe(screen.getByRole("tooltip", { hidden: true }).id);
  });
});
