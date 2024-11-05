// src/app/pages/join-game/join-game.component.spec.ts

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { JoinGameComponent } from './join-game.component';

describe('JoinGameComponent', () => {
    let component: JoinGameComponent;
    let fixture: ComponentFixture<JoinGameComponent>;
    let mockRouter: any;
    let mockWebSocketService: any;

    beforeEach(async () => {
        mockRouter = {
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
        };

        mockWebSocketService = {
            init: jasmine.createSpy('init'),
            joinGame: jasmine.createSpy('joinGame'),
        };

        await TestBed.configureTestingModule({
            imports: [FormsModule, CommonModule, JoinGameComponent],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: WebSocketService, useValue: mockWebSocketService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should show error message if access code is invalid', () => {
        component.accessCode = null;
        component.joinGame();
        expect(component.errorMessage).toBe("Le code d'accès est invalide !");
        expect(mockWebSocketService.init).not.toHaveBeenCalled();
        expect(mockWebSocketService.joinGame).not.toHaveBeenCalled();
    });

    it('should join game if access code is valid', () => {
        component.accessCode = 1234;
        component.joinGame();
        expect(component.errorMessage).toBeNull();
        expect(mockWebSocketService.init).toHaveBeenCalled();
        expect(mockWebSocketService.joinGame).toHaveBeenCalledWith(1234);
    });

    it('should prevent non-numeric input in access code field', () => {
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        const event = new KeyboardEvent('keydown', { key: inputElement });
        spyOn(event, 'preventDefault');
        component.allowOnlyNumbers(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should allow numeric input in access code field', () => {
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        const event = new KeyboardEvent('keydown', { key: inputElement.value });
        spyOn(event, 'preventDefault');
        component.allowOnlyNumbers(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should prevent input if maximum characters reached', () => {
        component.accessCode = 1234;
        fixture.detectChanges();
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        inputElement.value = '1234';
        const event = new KeyboardEvent('keydown', { key: '5' });
        spyOn(event, 'preventDefault');
        component.allowOnlyNumbers(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should navigate to home when goHome is called', () => {
        component.goHome();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should only allow numbers and limit input length', () => {
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;

        // Simulate input with numeric keys
        const numericEvent = new KeyboardEvent('keydown', { key: inputElement });
        spyOn(numericEvent, 'preventDefault');
        component.allowOnlyNumbers(numericEvent);
        expect(numericEvent.preventDefault).toHaveBeenCalled();

        // Simulate input with non-numeric key
        const nonNumericEvent = new KeyboardEvent('keydown', { key: 'x' });
        spyOn(nonNumericEvent, 'preventDefault');
        component.allowOnlyNumbers(nonNumericEvent);
        expect(nonNumericEvent.preventDefault).toHaveBeenCalled();

        // Simulate input when maximum characters reached
        component.accessCode = 1234;
        fixture.detectChanges();
        const maxCharEvent = new KeyboardEvent('keydown', { key: '5' });
        spyOn(maxCharEvent, 'preventDefault');
        component.allowOnlyNumbers(maxCharEvent);
        expect(maxCharEvent.preventDefault).toHaveBeenCalled();
    });
});
