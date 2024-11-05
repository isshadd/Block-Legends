import { GameSocketRoomService, GameTimerState } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayGameBoardTimeService } from './play-game-board-time.service';

jest.useFakeTimers();

describe('PlayGameBoardTimeService', () => {
    let service: PlayGameBoardTimeService;
    let gameSocketRoomService: jest.Mocked<GameSocketRoomService>;

    beforeEach(async () => {
        const mockGameSocketRoomService = {
            gameTimerRooms: new Map<number, any>(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayGameBoardTimeService, { provide: GameSocketRoomService, useValue: mockGameSocketRoomService }],
        }).compile();

        service = module.get<PlayGameBoardTimeService>(PlayGameBoardTimeService);
        gameSocketRoomService = module.get<GameSocketRoomService>(GameSocketRoomService) as jest.Mocked<GameSocketRoomService>;
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Timer Management', () => {
        const accessCode = 1001;
        const initialTimer = {
            state: GameTimerState.PreparingTurn,
            time: 3,
            isPaused: false,
        };

        beforeEach(() => {
            gameSocketRoomService.gameTimerRooms.set(accessCode, { ...initialTimer });
        });

        it('should set timer to PreparingTurn', () => {
            service.setTimerPreparingTurn(accessCode);
            const timer = gameSocketRoomService.gameTimerRooms.get(accessCode);
            expect(timer.state).toBe(GameTimerState.PreparingTurn);
            expect(timer.time).toBe(service.preparingTurnTime);
        });

        it('should set timer to ActiveTurn', () => {
            service.setTimerActiveTurn(accessCode);
            const timer = gameSocketRoomService.gameTimerRooms.get(accessCode);
            expect(timer.state).toBe(GameTimerState.ActiveTurn);
            expect(timer.time).toBe(service.activeTurnTime);
        });

        it('should pause and resume the timer', () => {
            service.pauseTimer(accessCode);
            let timer = gameSocketRoomService.gameTimerRooms.get(accessCode);
            expect(timer.isPaused).toBe(true);

            service.resumeTimer(accessCode);
            timer = gameSocketRoomService.gameTimerRooms.get(accessCode);
            expect(timer.isPaused).toBe(false);
        });
    });

    describe('Timer Countdown and Signals', () => {
        it('should decrement time and emit signalRoomTimePassed', () => {
            const accessCode = 2001;
            const mockTimer = { state: GameTimerState.ActiveTurn, time: 5, isPaused: false };
            gameSocketRoomService.gameTimerRooms.set(accessCode, mockTimer);

            const spy = jest.fn();
            service.signalRoomTimePassed$.subscribe(spy);

            service.secondPassed();

            expect(mockTimer.time).toBe(4);
            expect(spy).toHaveBeenCalledWith(accessCode);
        });

        it('should emit signalRoomTimeOut when time reaches zero', () => {
            const accessCode = 2002;
            const mockTimer = { state: GameTimerState.ActiveTurn, time: 0, isPaused: false };
            gameSocketRoomService.gameTimerRooms.set(accessCode, mockTimer);

            const spy = jest.fn();
            service.signalRoomTimeOut$.subscribe(spy);

            service.secondPassed();

            expect(mockTimer.time).toBe(0);
            expect(spy).toHaveBeenCalledWith(accessCode);
        });

        it('should not decrement or emit signals if timer is paused', () => {
            const accessCode = 2003;
            const mockTimer = { state: GameTimerState.ActiveTurn, time: 5, isPaused: true };
            gameSocketRoomService.gameTimerRooms.set(accessCode, mockTimer);

            const spyPassed = jest.fn();
            const spyTimeout = jest.fn();
            service.signalRoomTimePassed$.subscribe(spyPassed);
            service.signalRoomTimeOut$.subscribe(spyTimeout);

            service.secondPassed();

            expect(mockTimer.time).toBe(5);
            expect(spyPassed).not.toHaveBeenCalled();
            expect(spyTimeout).not.toHaveBeenCalled();
        });
    });

    describe('startTimer', () => {
        it('should call secondPassed every second', () => {
            const spy = jest.spyOn(service, 'secondPassed');
            service.startTimer();

            jest.advanceTimersByTime(3000);

            expect(spy).toHaveBeenCalled();
        });
    });
});
