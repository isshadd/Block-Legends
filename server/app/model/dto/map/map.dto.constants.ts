import { MapSize } from '@common/enums/map-size';

export const MAP_CONSTANTS = {
    NAME_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 255,
    ALLOWED_SIZES: [MapSize.SMALL, MapSize.MEDIUM, MapSize.LARGE] as const,
};
