import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
    const { container, rerender } = render(<CharacterAvatar characterId="mika" syncRatio={150} />);
    const fill = container.querySelector<HTMLElement>(".mm-sync-bar__fill");
    expect(fill?.style.width).toBe("100%");

    rerender(<CharacterAvatar characterId="mika" syncRatio={-20} />);
    expect(fill?.style.width).toBe("0%");
  });

  it("renders provided bond traits as pill spans", () => {
    const { container } = render(
      <CharacterAvatar characterId="mika" syncRatio={50} bondTraits={["kind", "bold"]} />,
    );
    const traits = container.querySelectorAll(".mm-sync-trait");
    expect(traits).toHaveLength(2);
    expect(traits[0]?.textContent).toContain("kind");
    expect(traits[1]?.textContent).toContain("bold");
  });

  it("caps bond traits at two to protect the layout", () => {
    const { container } = render(
      <CharacterAvatar
        characterId="mika"
        syncRatio={50}
        bondTraits={["kind", "bold", "loyal", "fierce"]}
      />,
    );
    expect(container.querySelectorAll(".mm-sync-trait")).toHaveLength(2);
  });

  it("exposes sync ratio via aria-label on the wrapper", () => {
    const { container } = render(<CharacterAvatar characterId="mika" syncRatio={73} />);
    const wrapper = container.querySelector<HTMLElement>(".character-avatar");
    expect(wrapper?.getAttribute("aria-label")).toContain("73");
  });
});

describe("CharacterAvatar — emotion + cross-fade", () => {
  it("renders the single legacy img when emotion is omitted", () => {
    const { container } = render(<CharacterAvatar characterId="mika" />);
    expect(container.querySelector(".character-avatar__image-stack")).toBeNull();
    const img = container.querySelector<HTMLImageElement>(".character-avatar__image");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("/characters/mika.svg");
  });

  it("renders an image-stack with active layer for a known emotion", () => {
    const { container } = render(<CharacterAvatar characterId="mika" emotion="thinking" />);
    const stack = container.querySelector(".character-avatar__image-stack");
    expect(stack).not.toBeNull();
    const active = container.querySelector<HTMLImageElement>(".character-avatar__layer--active");
    expect(active?.getAttribute("src")).toBe("/characters/mika/04-thinking.jpg");
  });

  it("emits a previous layer on cross-fade after the emotion changes", () => {
    const { container, rerender } = render(
      <CharacterAvatar characterId="mika" emotion="thinking" />,
    );
    expect(container.querySelector(".character-avatar__layer--prev")).toBeNull();

    rerender(<CharacterAvatar characterId="mika" emotion="happy" />);
    const prev = container.querySelector<HTMLImageElement>(".character-avatar__layer--prev");
    const active = container.querySelector<HTMLImageElement>(".character-avatar__layer--active");
    expect(prev?.getAttribute("src")).toBe("/characters/mika/04-thinking.jpg");
    expect(active?.getAttribute("src")).toBe("/characters/mika/05-happy.jpg");
  });

  it("falls back to legacy single img when emotion has no asset", () => {
    // aki has no "love" image — resolver returns DEFAULT_CHARACTER_AVATAR_PATH
    const { container } = render(<CharacterAvatar characterId="aki" emotion="love" />);
    expect(container.querySelector(".character-avatar__image-stack")).toBeNull();
    expect(container.querySelector(".character-avatar__image")).not.toBeNull();
  });

  it("includes the emotion in the wrapper aria-label", () => {
    const { container } = render(<CharacterAvatar characterId="ren" emotion="thinking" />);
    const wrapper = container.querySelector<HTMLElement>(".character-avatar");
    expect(wrapper?.getAttribute("aria-label")).toContain("thinking");
    expect(wrapper?.getAttribute("data-emotion")).toBe("thinking");
  });
});
