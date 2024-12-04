import { ComponentFixture, TestBed } from '@angular/core/testing';
// This line is necessary for the PlaceableEntityFullMenuComponent to work and should not be refactored. We have to disable max-len
// eslint-disable-next-line max-len
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager/map-editor-manager.service';
import { PlaceableEntityFullMenuComponent } from './placeable-entity-full-menu.component';

describe('PlaceableEntityFullMenuComponent', () => {
    let component: PlaceableEntityFullMenuComponent;
    let fixture: ComponentFixture<PlaceableEntityFullMenuComponent>;
    let mapEditorManagerService: jasmine.SpyObj<MapEditorManagerService>;

    beforeEach(async () => {
        const mapEditorSpy = jasmine.createSpyObj('MapEditorManagerService', ['someMethod']);

        await TestBed.configureTestingModule({
            imports: [PlaceableEntityFullMenuComponent],
            providers: [{ provide: MapEditorManagerService, useValue: mapEditorSpy }, provideHttpClientTesting()],
        }).compileComponents();

        mapEditorManagerService = TestBed.inject(MapEditorManagerService) as jasmine.SpyObj<MapEditorManagerService>;

        fixture = TestBed.createComponent(PlaceableEntityFullMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should inject mapEditorManagerService', () => {
        expect(mapEditorManagerService).toBeTruthy();
    });
});
