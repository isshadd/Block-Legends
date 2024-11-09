import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerMapEntityInfoViewComponent } from './player-map-entity-info-view.component';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { ElementRef } from '@angular/core';
import { EventEmitter } from '@angular/core';

describe('PlayerMapEntityInfoViewComponent', () => {
    let component: PlayerMapEntityInfoViewComponent;
    let fixture: ComponentFixture<PlayerMapEntityInfoViewComponent>;
    let mockElementRef: jasmine.SpyObj<ElementRef>;

    // Mock PlayerCharacter for testing
    const mockPlayerCharacter: PlayerCharacter = {
        dice: 'attack',
        attributes: {
            life: 3,
            defense: 2,
            speed: 4,
            attack: 2
        }
    } as PlayerCharacter;

    const mockPlayerCharacterDefault: PlayerCharacter = {
        dice: 'default',
        attributes: {
            life: 3,
            defense: 2,
            speed: 4,
            attack: 2
        }
    } as PlayerCharacter;

    beforeEach(async () => {
        mockElementRef = jasmine.createSpyObj('ElementRef', [], {
            nativeElement: document.createElement('div')
        });

        await TestBed.configureTestingModule({
            imports: [PlayerMapEntityInfoViewComponent],
            providers: [
                { provide: ElementRef, useValue: mockElementRef }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerMapEntityInfoViewComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input properties', () => {
        it('should have default scale value of 1', () => {
            expect(component.scale).toBe(1);
        });

        it('should have default showButton value of true', () => {
            expect(component.showButton).toBeTrue();
        });

        it('should accept playerCharacter input', () => {
            component.playerCharacter = mockPlayerCharacter;
            expect(component.playerCharacter).toEqual(mockPlayerCharacter);
        });

        it('should accept actionPoints input', () => {
            const testActionPoints = 5;
            component.actionPoints = testActionPoints;
            expect(component.actionPoints).toBe(testActionPoints);
        });

        it('should accept totalLife input', () => {
            const testTotalLife = 10;
            component.totalLife = testTotalLife;
            expect(component.totalLife).toBe(testTotalLife);
        });

        it('should accept scale input', () => {
            const testScale = 2;
            component.scale = testScale;
            expect(component.scale).toBe(testScale);
        });

        it('should accept showButton input', () => {
            const testShowButton = false;
            component.showButton = testShowButton;
            expect(component.showButton).toBe(testShowButton);
        });
    });

    describe('ngOnInit', () => {
        it('should set attack dice values when playerCharacter dice is attack', () => {
            component.playerCharacter = mockPlayerCharacter;
            component.ngOnInit();
            expect(component.attackDice).toBe('(D6)');
            expect(component.defenseDice).toBe('(D4)');
        });

        it('should set default dice values when playerCharacter dice is not attack', () => {
            component.playerCharacter = mockPlayerCharacterDefault;
            component.ngOnInit();
            expect(component.attackDice).toBe('(D6)');
            expect(component.defenseDice).toBe('(D6)');
        });
    });

    describe('Getter methods', () => {
        beforeEach(() => {
            component.playerCharacter = mockPlayerCharacter;
        });

        it('should return correct healthArray', () => {
            const result = component.healthArray;
            expect(result.length).toBe(mockPlayerCharacter.attributes.life);
        });

        it('should return correct defenseArray', () => {
            const result = component.defenseArray;
            expect(result.length).toBe(mockPlayerCharacter.attributes.defense);
        });

        it('should return correct speedArray', () => {
            const result = component.speedArray;
            expect(result.length).toBe(mockPlayerCharacter.attributes.speed);
        });

        it('should return correct attackArray', () => {
            const result = component.attackArray;
            expect(result.length).toBe(mockPlayerCharacter.attributes.attack);
        });
    });

    describe('Events', () => {
        it('should emit closeP event when closePanel is called', () => {
            spyOn(component.closeP, 'emit');
            component.closePanel();
            expect(component.closeP.emit).toHaveBeenCalled();
        });

        it('should have close EventEmitter', () => {
            expect(component.close).toBeTruthy();
            expect(component.close instanceof EventEmitter).toBeTruthy();
        });
    });

    describe('Edge cases', () => {
        it('should handle zero values in attributes', () => {
            const zeroPlayerCharacter = {
                dice: 'attack',
                attributes: {
                    life: 0,
                    defense: 0,
                    speed: 0,
                    attack: 0
                }
            } as PlayerCharacter;

            component.playerCharacter = zeroPlayerCharacter;
            expect(component.healthArray.length).toBe(0);
            expect(component.defenseArray.length).toBe(0);
            expect(component.speedArray.length).toBe(0);
            expect(component.attackArray.length).toBe(0);
        });
    });
});