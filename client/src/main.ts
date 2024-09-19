import { provideHttpClient } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Routes, provideRouter } from '@angular/router';
import { AdministrationGameComponent } from '@app/pages/administration-game/administration-game.component';
import { AppComponent } from '@app/pages/app/app.component';
import { CreateCharacterComponent } from '@app/pages/create-character/create-character.component';
import { CreateGameComponent } from '@app/pages/create-game/create-game.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { JoinGameComponent } from '@app/pages/join-game/join-game.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MapEditorComponent } from '@app/pages/map-editor/map-editor.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { WaitingViewComponent } from '@app/pages/waiting-view/waiting-view.component';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'join-game', component: JoinGameComponent },
    { path: 'administration-game', component: AdministrationGameComponent },
    { path: 'create-game', component: CreateGameComponent },
    { path: 'create-character', component: CreateCharacterComponent },
    { path: 'waiting-view', component: WaitingViewComponent },
    { path: 'map-editor', component: MapEditorComponent },
    { path: '**', redirectTo: '/home' },
];

bootstrapApplication(AppComponent, {
    providers: [provideHttpClient(), provideRouter(routes), provideAnimations()],
});
