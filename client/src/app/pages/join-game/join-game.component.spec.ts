import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Subject } from 'rxjs';
import { JoinGameComponent } from './join-game.component';

describe('JoinGameComponent', () => {
    let component: JoinGameComponent;
    let fixture: ComponentFixture<JoinGameComponent>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let avatarTakenErrorSubject: Subject<string>;

    beforeEach(async () => {
        avatarTakenErrorSubject = new Subject<string>();
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['init', 'joinGame'], {
            avatarTakenError$: avatarTakenErrorSubject.asObservable(),
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [FormsModule, JoinGameComponent],
            providers: [
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // Test for ngOnInit and error subscription
    it('should handle avatar taken error message', fakeAsync(() => {
        const errorMessage = 'Avatar already taken';
        spyOn(window, 'alert');

        avatarTakenErrorSubject.next(errorMessage);
        tick();

        expect(component.errorMessage).toBe(errorMessage);
        expect(window.alert).toHaveBeenCalledWith(errorMessage);
    }));

    // Tests for joinGame method
    it('should show error message when access code is null', () => {
        component.accessCode = null;
        component.joinGame();
        expect(component.errorMessage).toBe("Le code d'accès est invalide !");
        expect(webSocketServiceSpy.init).not.toHaveBeenCalled();
        expect(webSocketServiceSpy.joinGame).not.toHaveBeenCalled();
    });

    it('should initialize websocket and join game when access code is valid', () => {
        component.accessCode = 1234;
        component.joinGame();

        expect(component.errorMessage).toBeNull();
        expect(webSocketServiceSpy.init).toHaveBeenCalled();
        expect(webSocketServiceSpy.joinGame).toHaveBeenCalledWith(1234);
    });

    // Tests for allowOnlyNumbers method
    it('should allow numeric input', () => {
        const event = new KeyboardEvent('keypress', { key: '5' });
        const input = document.createElement('input');
        input.value = '123';
        const preventDefaultSpy = spyOn(event, 'preventDefault');

        Object.defineProperty(event, 'target', { value: input });
        component.allowOnlyNumbers(event);

        expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should prevent non-numeric input', () => {
        const event = new KeyboardEvent('keypress', { key: 'a' });
        const input = document.createElement('input');
        const preventDefaultSpy = spyOn(event, 'preventDefault');

        Object.defineProperty(event, 'target', { value: input });
        component.allowOnlyNumbers(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent input when max length is reached', () => {
        const event = new KeyboardEvent('keypress', { key: '5' });
        const input = document.createElement('input');
        input.value = '1234'; // MAX_VALUE is 4
        const preventDefaultSpy = spyOn(event, 'preventDefault');

        Object.defineProperty(event, 'target', { value: input });
        component.allowOnlyNumbers(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should allow control keys when max length is reached', () => {
        const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
        const input = document.createElement('input');
        input.value = '1234';

        controlKeys.forEach((key) => {
            const event = new KeyboardEvent('keypress', { key });
            const preventDefaultSpy = spyOn(event, 'preventDefault');

            Object.defineProperty(event, 'target', { value: input });
            component.allowOnlyNumbers(event);

            expect(preventDefaultSpy).not.toHaveBeenCalled();
        });
    });

    // Test for goHome method
    it('should navigate to home route', () => {
        component.goHome();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
