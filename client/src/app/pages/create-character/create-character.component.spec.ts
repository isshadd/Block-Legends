import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCharacterComponent } from './create-character.component';

describe('CreateCharacterComponent', () => {
    let component: CreateCharacterComponent;
    let fixture: ComponentFixture<CreateCharacterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreateCharacterComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateCharacterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a character object with default values', () => {
        expect(component.character).toEqual({
            name: '', // à changer plus tard
            avatar: '', // à changer plus tard
            life: 4,
            speed: 4,
            attack: 4,
            defense: 4,
        });
    });
});
