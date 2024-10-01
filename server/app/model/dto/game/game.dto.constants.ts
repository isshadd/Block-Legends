import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';

export const MAP_CONSTANTS = {
    nameMaxLength: 50,
    descriptionMaxLength: 255,
    allowedSizes: [MapSize.SMALL, MapSize.MEDIUM, MapSize.LARGE] as const,
    allowedModes: [GameMode.CTF, GameMode.Classique] as const,
};
