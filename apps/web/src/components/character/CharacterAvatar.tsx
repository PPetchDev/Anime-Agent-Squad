import { useEffect, useRef, useState } from "react";

import {
  type CharacterEmotion,
  DEFAULT_CHARACTER_AVATAR_PATH,
  getCharacterTemplate,
  resolveCharacterAvatarPath,
  resolveCharacterEmotionImagePath,
} from "@octogent/core";

type CharacterAvatarProps = {
  characterId?: string | undefined;
  customAvatarPath?: string | undefined;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
  syncRatio?: number;
  bondTraits?: readonly string[];
  emotion?: CharacterEmotion | undefined;
};

type ImageStackProps = {
  activeSrc: string;
  prevSrc: string | null;
  imgClassName: string;
  useStack: boolean;
};

const clampRatio = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const handleAvatarImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.src.endsWith(DEFAULT_CHARACTER_AVATAR_PATH)) return;
  image.src = DEFAULT_CHARACTER_AVATAR_PATH;
};

// When `useStack` is true we render two stacked layers so CSS can cross-fade
// between emotion frames. The `prev` layer stays mounted but invisible
// (opacity:0) until a previous src is captured. When `useStack` is false the
// component renders a single legacy img identical to the prior behavior so
// callers that don't pass `emotion` see no change.
const AvatarImageStack = ({ activeSrc, prevSrc, imgClassName, useStack }: ImageStackProps) => {
  if (!useStack) {
    return <img className={imgClassName} src={activeSrc} alt="" onError={handleAvatarImageError} />;
  }
  const layerClass = imgClassName
    ? `${imgClassName} character-avatar__layer`
    : "character-avatar__layer";
  return (
    <span className="character-avatar__image-stack">
      {prevSrc !== null && (
        <img
          className={`${layerClass} character-avatar__layer--prev`}
          src={prevSrc}
          alt=""
          aria-hidden="true"
          onError={handleAvatarImageError}
        />
      )}
      <img
        className={`${layerClass} character-avatar__layer--active`}
        src={activeSrc}
        alt=""
        onError={handleAvatarImageError}
      />
    </span>
  );
};

export const CharacterAvatar = ({
  characterId,
  customAvatarPath,
  size = "md",
  showDetails = false,
  className,
  syncRatio,
  bondTraits,
  emotion,
}: CharacterAvatarProps) => {
  const template = getCharacterTemplate(characterId);
  const baseAvatarPath = resolveCharacterAvatarPath({ characterId, customAvatarPath });
  const emotionPath = emotion ? resolveCharacterEmotionImagePath(characterId, emotion) : null;
  // When an emotion is supplied but it has no asset, the resolver returns the
  // default avatar path — fall back to the legacy single-image branch in that
  // case so we don't cross-fade two copies of the same default image.
  const useEmotionStack =
    emotion !== undefined && emotionPath !== null && emotionPath !== DEFAULT_CHARACTER_AVATAR_PATH;
  const activeSrc = useEmotionStack ? (emotionPath as string) : baseAvatarPath;

  // Track the previous active src so we can render two stacked layers and let
  // CSS cross-fade between them. We only retain a prev frame when an emotion
  // is in play — without one, behavior matches the original single <img>.
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const lastSrcRef = useRef(activeSrc);
  useEffect(() => {
    if (!useEmotionStack) {
      if (lastSrcRef.current !== activeSrc) {
        lastSrcRef.current = activeSrc;
      }
      if (prevSrc !== null) setPrevSrc(null);
      return;
    }
    if (lastSrcRef.current === activeSrc) {
      return;
    }
    setPrevSrc(lastSrcRef.current);
    lastSrcRef.current = activeSrc;
  }, [activeSrc, useEmotionStack, prevSrc]);

  const name = template?.name ?? "Octogent Agent";
  const title = template?.title ?? "Unassigned";
  const traits = template?.shortTraits ?? [];
  const detailText = traits.length > 0 ? `${title} - ${traits.join(", ")}` : title;
  const hasSync = typeof syncRatio === "number";
  const clampedRatio = hasSync ? clampRatio(syncRatio as number) : 0;
  const emotionSuffix = emotion ? `, ${emotion}` : "";
  const ariaLabel = hasSync
    ? `${name}, ${detailText}, sync ${Math.round(clampedRatio)}%${emotionSuffix}`
    : `${name}: ${detailText}${emotionSuffix}`;

  const effectivePrevSrc = useEmotionStack ? prevSrc : null;

  return (
    <span
      className={[
        "character-avatar",
        `character-avatar--${size}`,
        showDetails ? "character-avatar--with-details" : "",
        hasSync ? "character-avatar--with-sync" : "",
        useEmotionStack ? "character-avatar--with-emotion" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      title={`${name}: ${detailText}`}
      aria-label={ariaLabel}
      data-emotion={emotion ?? undefined}
    >
      {hasSync ? (
        <span className={`mm-sync-avatar mm-sync-avatar--${size}`}>
          <span className="mm-sync-avatar__ring-outer" aria-hidden="true" />
          <span className="mm-sync-avatar__ring" aria-hidden="true" />
          <span className="mm-sync-avatar__core">
            <AvatarImageStack
              activeSrc={activeSrc}
              prevSrc={effectivePrevSrc}
              imgClassName=""
              useStack={useEmotionStack}
            />
          </span>
        </span>
      ) : (
        <AvatarImageStack
          activeSrc={activeSrc}
          prevSrc={effectivePrevSrc}
          imgClassName="character-avatar__image"
          useStack={useEmotionStack}
        />
      )}

      {hasSync ? (
        <span className="mm-sync-body">
          <span className="mm-sync-name">{name}</span>
          <span className="mm-sync-bar">
            <span className="mm-sync-bar__label">SYNC</span>
            <span className="mm-sync-bar__track">
              <span className="mm-sync-bar__fill" style={{ width: `${clampedRatio}%` }} />
            </span>
            <span className="mm-sync-bar__value">{Math.round(clampedRatio)}%</span>
          </span>
          {bondTraits && bondTraits.length > 0 ? (
            <span className="mm-sync-traits">
              {bondTraits.slice(0, 2).map((trait) => (
                <span key={trait} className="mm-sync-trait">
                  {trait}
                </span>
              ))}
            </span>
          ) : null}
        </span>
      ) : (
        showDetails && (
          <span className="character-avatar__details">
            <span className="character-avatar__name">{name}</span>
            <span className="character-avatar__title">{title}</span>
            {traits.length > 0 && (
              <span className="character-avatar__traits">{traits.slice(0, 2).join(" / ")}</span>
            )}
          </span>
        )
      )}
    </span>
  );
};
