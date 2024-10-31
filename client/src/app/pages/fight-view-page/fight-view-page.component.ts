import { Component } from '@angular/core';
import { FightViewComponent } from "../../components/play-area/fight-view/fight-view.component";

@Component({
    selector: 'app-fight-view-page',
    standalone: true,
    imports: [FightViewComponent],
    templateUrl: './fight-view-page.component.html',
    styleUrl: './fight-view-page.component.scss',
})
export class FightViewPageComponent {}
