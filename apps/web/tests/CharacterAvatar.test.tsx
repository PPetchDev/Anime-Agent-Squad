import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { CharacterAvatar } from "../src/components/character/CharacterAvatar";

describe("CharacterAvatar — magical-mecha sync ring", () => {
  it("renders no sync ring when syncRatio is omitted (backward compatible)", () => {
    const { container } = render(<CharacterAvatar characterId="mika" />);
    expect(container.querySelector(".mm-sync-avatar__ring")).toBeNull();
    expect(container.querySelector(".mm-sync-bar")).toBeNull();
  });

  it("renders the dashed ring + sync bar when syncRatio is provided", () => {
    const { container } = render(<CharacterAvatar characterId="mika" syncRatio={73} />);
    expect(container.querySelector(".mm-sync-avatar__ring")).not.toBeNull();
    const fill = container.querySelector<HTMLElement>(".mm-sync-bar__fill");
    expect(fill).not.toBeNull();
    expect(fill?.style.width).toBe("73%");
  });

  it("clamps syncRatio to [0, 100]", () => {
    const { container, rerender } = render(
      <CharacterAvatar characterId="mika" syncRatio={150} />,
    );
    const fill = container.querySelector<HTMLElement>(".mm-sync-bar__fill");
    expect(fill?.style.width).toBe("100%");

    rerender(<CharacterAvatar characterId="mika" syncRatio={-20} />);
    expect(fill?.style.width).toBe("0%");
  });

  it("renders provided bond traits as pill spans", () => {
    const { container } = render(
      <CharacterAvatar
        characterId="mika"
        syncRatio={50}
        bondTraits={["kind", "bold"]}
      />,
    );
    const traits = container.querySelectorAll(".mm-sync-trait");
    expect(traits).toHaveLength(2);
    expect(traits[0]?.textContent).toContain("kind");
    expect(traits[1]?.textContent).toContain("bold");
  });

  it("exposes sync ratio via aria-label on the wrapper", () => {
    const { container } = render(<CharacterAvatar characterId="mika" syncRatio={73} />);
    const wrapper = container.querySelector<HTMLElement>(".character-avatar");
    expect(wrapper?.getAttribute("aria-label")).toContain("73");
  });
});
