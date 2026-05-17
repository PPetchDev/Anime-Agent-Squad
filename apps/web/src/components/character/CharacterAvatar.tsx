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
};

export const CharacterAvatar = ({
  characterId,
  customAvatarPath,
  size = "md",
  showDetails = false,
  className,
}: CharacterAvatarProps) => {
  const template = getCharacterTemplate(characterId);
  const avatarPath = resolveCharacterAvatarPath({ characterId, customAvatarPath });
  const name = template?.name ?? "Octogent Agent";
  const title = template?.title ?? "Unassigned";
  const traits = template?.shortTraits ?? [];
  const detailText = traits.length > 0 ? `${title} - ${traits.join(", ")}` : title;

  return (
    <span
      className={[
        "character-avatar",
        `character-avatar--${size}`,
        showDetails ? "character-avatar--with-details" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      title={`${name}: ${detailText}`}
    >
      <img
        className="character-avatar__image"
        src={avatarPath}
        alt=""
        onError={(event) => {
          const image = event.currentTarget;
          if (image.src.endsWith(DEFAULT_CHARACTER_AVATAR_PATH)) {
            return;
          }
          image.src = DEFAULT_CHARACTER_AVATAR_PATH;
        }}
      />
      {showDetails && (
        <span className="character-avatar__details">
          <span className="character-avatar__name">{name}</span>
          <span className="character-avatar__title">{title}</span>
          {traits.length > 0 && (
            <span className="character-avatar__traits">{traits.slice(0, 2).join(" / ")}</span>
          )}
        </span>
      )}
    </span>
  );
};
