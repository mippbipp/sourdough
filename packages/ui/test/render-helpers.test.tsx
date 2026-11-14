import { AttachmentTrigger } from "@sourdough/ui/components/attachment";
import { Bubble, BubbleContent } from "@sourdough/ui/components/bubble";
import { Marker } from "@sourdough/ui/components/marker";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("render helpers", () => {
  it("keeps Marker's slot and variant attributes", () => {
    expect.hasAssertions();

    render(<Marker variant="separator">Today</Marker>);

    const marker = screen.getByText("Today");

    expect(marker.dataset.slot).toBe("marker");
    expect(marker.dataset.variant).toBe("separator");
  });

  it("lets BubbleContent render as a button and keeps its slot", () => {
    expect.hasAssertions();

    render(
      <Bubble>
        <BubbleContent render={<button type="button" aria-label="Hi" />}>
          Hi
        </BubbleContent>
      </Bubble>
    );

    const content = screen.getByRole("button", { name: "Hi" });

    expect(content.dataset.slot).toBe("bubble-content");
    expect(content.className).toContain("rounded-none");
  });

  it("gives AttachmentTrigger type=button, but not when it renders a link", () => {
    expect.hasAssertions();

    render(
      <>
        <AttachmentTrigger aria-label="Open file" />
        <AttachmentTrigger
          render={<a href="/f" aria-label="Download" />}
          aria-label="Download"
        />
      </>
    );

    const button = screen.getByRole("button", { name: "Open file" });

    expect(button.getAttribute("type")).toBe("button");
    expect(button.dataset.slot).toBe("attachment-trigger");
    expect(
      screen.getByRole("link", { name: "Download" }).getAttribute("type")
    ).toBeNull();
  });
});
