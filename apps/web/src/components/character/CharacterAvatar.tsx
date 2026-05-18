import {
  DEFAULT_CHARACTER_AVATAR_PATH,
  getCharacterTemplate,
  resolveCharacterAvatarPath,
} from "@octogent/core";

type CharacterAvatarProps = {
  characterId?: string | undefined;
  customAvatarPath?: string | undefined;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
  syncRatio?: number;
  bondTraits?: readonly string[];
};

const clampRatio = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

export const CharacterAvatar = ({
  characterId,
  customAvatarPath,
  size = "md",
  showDetails = false,
  className,
  syncRatio,
  bondTraits,
}: CharacterAvatarProps) => {
  const template = getCharacterTemplate(characterId);
  const avatarPath = resolveCharacterAvatarPath({ characterId, customAvatarPath });
  const name = template?.name ?? "Octogent Agent";
  const title = template?.title ?? "Unassigned";
  const traits = template?.shortTraits ?? [];
  const detailText = traits.length > 0 ? `${title} - ${traits.join(", ")}` : title;
  const hasSync = typeof syncRatio === "number";
  const clampedRatio = hasSync ? clampRatio(syncRatio as number) : 0;
  const ariaLabel = hasSync
    ? `${name}, sync ${Math.round(clampedRatio)}%`
    : `${name}: ${detailText}`;

  return (
    <span
      className={[
        "character-avatar",
        `character-avatar--${size}`,
        showDetails ? "character-avatar--with-details" : "",
        hasSync ? "character-avatar--with-sync" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      title={`${name}: ${detailText}`}
      aria-label={ariaLabel}
    >
      {hasSync ? (
        <span className={`mm-sync-avatar mm-sync-avatar--${size}`}>
          <span className="mm-sync-avatar__ring-outer" aria-hidden="true"></span>
          <span className="mm-sync-avatar__ring" aria-hidden="true"></span>
          <span className="mm-sync-avatar__core">
            <img
              src={avatarPath}
              alt=""
              onError={(event) => {
                const image = event.currentTarget;
                if (image.src.endsWith(DEFAULT_CHARACTER_AVATAR_PATH)) return;
                image.src = DEFAULT_CHARACTER_AVATAR_PATH;
              }}
            />
          </span>
        </span>
      ) : (
        <img
          className="character-avatar__image"
          src={avatarPath}
          alt=""
          onError={(event) => {
            const image = event.currentTarget;
            if (image.src.endsWith(DEFAULT_CHARACTER_AVATAR_PATH)) return;
            image.src = DEFAULT_CHARACTER_AVATAR_PATH;
          }}
        />
      )}

      {hasSync ? (
        <span className="mm-sync-body">
          <span className="mm-sync-name">{name}</span>
          <span className="mm-sync-bar">
            <span className="mm-sync-bar__label">SYNC</span>
            <span className="mm-sync-bar__track">
              <span
                className="mm-sync-bar__fill"
                style={{ width: `${clampedRatio}%` }}
              ></span>
            </span>
            <span className="mm-sync-bar__value">{Math.round(clampedRatio)}%</span>
          </span>
          {bondTraits && bondTraits.length > 0 ? (
            <span className="mm-sync-traits">
              {bondTraits.map((trait) => (
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
