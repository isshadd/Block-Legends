import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Routes, provideRouter } from '@angular/router';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication.service';
import { of, throwError } from 'rxjs';
import SpyObj = jasmine.SpyObj;

const routes: Routes = [];

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost']);
        communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        communicationServiceSpy.basicPost.and.returnValue(of(new HttpResponse<string>({ status: 201, statusText: 'Created' })));

        await TestBed.configureTestingModule({
            imports: [MainPageComponent],
            providers: [
                {
                    provide: CommunicationService,
                    useValue: communicationServiceSpy,
                },
                provideHttpClientTesting(),
                provideRouter(routes),
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call basicPost when calling sendTimeToServer', () => {
        component.sendTimeToServer();
        expect(communicationServiceSpy.basicPost).toHaveBeenCalled();
    });

    it('should handle basicPost that returns a valid HTTP response', () => {
        component.sendTimeToServer();
        component.message.subscribe((res) => {
            expect(res).toContain('201 : Created');
        });
    });

    it('should handle basicPost that returns an invalid HTTP response', () => {
        communicationServiceSpy.basicPost.and.returnValue(throwError(() => new Error('test')));
        component.sendTimeToServer();
        component.message.subscribe({
            next: (res) => {
                expect(res).toContain('Le serveur ne répond pas');
            },
        });
    });
});
