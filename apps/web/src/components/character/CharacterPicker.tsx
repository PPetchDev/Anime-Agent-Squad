import { BUILT_IN_CHARACTER_TEMPLATES, CHARACTER_EMOTION_CATALOG } from "@octogent/core";

import { CharacterAvatar } from "./CharacterAvatar";

type CharacterPickerProps = {
  selectedCharacterId: string;
  onChange: (characterId: string) => void;
};

export const CharacterPicker = ({ selectedCharacterId, onChange }: CharacterPickerProps) => (
  <fieldset className="character-picker" aria-label="Agent character">
    {BUILT_IN_CHARACTER_TEMPLATES.map((template) => {
      const catalogEntry = CHARACTER_EMOTION_CATALOG[template.characterId];
      return (
        <button
          key={template.characterId}
          type="button"
          className={`character-picker__option${
            selectedCharacterId === template.characterId
              ? " character-picker__option--selected"
              : ""
          }`}
          onClick={() => onChange(template.characterId)}
          title={`${template.name}: ${template.title}`}
        >
          <CharacterAvatar
            characterId={template.characterId}
            size="sm"
            {...(catalogEntry ? { emotion: catalogEntry.defaultEmotion } : {})}
          />
          <span className="character-picker__label">{template.name}</span>
        </button>
      );
    })}
  </fieldset>
);
