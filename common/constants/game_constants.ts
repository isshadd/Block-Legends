import { ItemType } from '@common/enums/item-type';
import { MapSize } from '@common/enums/map-size';

export const MOUVEMENT_DELAY = 500;
export const GAME_CODE_MAX_VALUE = 4;
export const TIMEOUT_DURATION = 500;
export const SECONDS_IN_AN_HOUR = 3600;
export const SECONDS_IN_A_MINUTE = 60;
export const MAX_VP_PLAYER_NUMBER = 5;
export const MAX_STRING_LENGTH = 200;
export const RANDOM_NUMBER = 9;
export const RANDOM_SOCKET_NUMBER = 36;
export const POTION_DEFENSE_BONUS = 100;
export const ICE_FALL_POSSIBILTY = 0.1;
export const NECESSARY_WIN_NUMBER = 3;
export const WAIT_TIME = 5000;
export const INVENTORY_SIZE = 2;
export const BONUS_DICE_STAT = 6;
export const BASE_DICE_STAT = 4;
export const SUBSTRACT_ONE = 1;
export const SUBSTRACT_TWO = 2;
export const MOUVEMENT_INTERVAL = 150;
export const MIN_PLAYERS = 2;
export const MED_PLAYERS = 4;
export const MAX_PLAYERS = 6;
export const MIN_ACCESS_CODE = 1000;
export const MAX_ACCESS_CODE = 9999;
export const TURN_DELAY = 2000;

export const ITEM_LIMITS = {
    [MapSize.SMALL]: 2,
    [MapSize.MEDIUM]: 4,
    [MapSize.LARGE]: 6,
};

export const DEFENSIVE_PRIORITY = {
    [ItemType.MagicShield]: 10,
    [ItemType.Flag]: 10,
    [ItemType.Chestplate]: 9,
    [ItemType.EnchantedBook]: 8,
};
