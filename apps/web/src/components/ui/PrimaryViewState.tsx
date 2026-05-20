import type { ReactNode } from "react";

import { CharacterAvatar } from "../character";
import { type OctopusExpression } from "../EmptyOctopus";

type PrimaryViewStateTone = "empty" | "error" | "loading";

type PrimaryViewStateProps = {
  tone: PrimaryViewStateTone;
  /** Kana label shown in the HUD frame corner (e.g. エンプティ). */
  kanaLabel: string;
  /** Main heading line. */
  title: string;
  /** Optional secondary copy under the title. */
  description?: ReactNode;
  /** Optional CTA row rendered below the description. */
  actions?: ReactNode;
  /** Override the octopus expression. Sensible defaults per tone. */
  expression?: OctopusExpression;
  className?: string;
  testId?: string;
};

const TONE_DEFAULTS: Record<
  PrimaryViewStateTone,
  { expression: OctopusExpression; role?: "alert" | "status" }
> = {
  empty: { expression: "sleepy" },
  loading: { expression: "sleepy", role: "status" },
  error: { expression: "surprised", role: "alert" },
};

export const PrimaryViewState = ({
  tone,
  kanaLabel,
  title,
  description,
  actions,
  expression,
  className,
  testId,
}: PrimaryViewStateProps) => {
  const defaults = TONE_DEFAULTS[tone];
  const classes = [
    "primary-view-state",
    `primary-view-state--${tone}`,
    "mm-hud-frame",
    tone === "error" ? "mm-hud-frame--warning" : null,
    "mm-sparkle-host",
    "mm-sparkle-host--dense",
    className,
  ]
    .filter((value) => Boolean(value))
    .join(" ");

  return (
    <div
      className={classes}
      data-testid={testId}
      role={defaults.role}
      aria-live={tone === "error" ? "assertive" : tone === "loading" ? "polite" : undefined}
    >
      <span aria-hidden="true" className="mm-hud-frame__label">
        {kanaLabel}
      </span>
      <span aria-hidden="true" className="mm-sparkle-extra">
        ✦
      </span>
      <span aria-hidden="true" className="mm-hud-frame__corner-bl" />
      <span aria-hidden="true" className="mm-hud-frame__corner-br" />
      <div className="primary-view-state__inner">
        <div
          className="primary-view-state__glyph"
          aria-hidden="true"
          {...(testId ? { "data-testid": `${testId}-glyph` } : {})}
        >
          <CharacterAvatar
            characterId="mika"
            size="lg"
            className="primary-view-state__glyph-avatar"
            emotion={
              tone === "loading"
                ? "thinking"
                : (expression ?? defaults.expression) === "surprised"
                  ? "surprised"
                  : (expression ?? defaults.expression) === "happy"
                    ? "happy"
                    : (expression ?? defaults.expression) === "angry"
                      ? "angry"
                      : "sleepy"
            }
          />
        </div>
        <div className="primary-view-state__copy">
          <p className="primary-view-state__title">{title}</p>
          {description ? (
            <div className="primary-view-state__description">{description}</div>
          ) : null}
          {actions ? <div className="primary-view-state__actions">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
};
