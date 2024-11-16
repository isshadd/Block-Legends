import { GameTimerState } from '../enums/game.timer.state';

export interface GameTimer {
    time: number;
    isPaused: boolean;
    state: GameTimerState;
}
