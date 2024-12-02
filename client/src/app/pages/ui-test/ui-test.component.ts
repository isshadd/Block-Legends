import { Component } from '@angular/core';
import { PlayPageRightSideViewComponent } from '@app/components/play-page-right-side-view/play-page-right-side-view.component';

@Component({
    selector: 'app-ui-test',
    standalone: true,
    imports: [PlayPageRightSideViewComponent],
    templateUrl: './ui-test.component.html',
    styleUrl: './ui-test.component.scss',
})
export class UiTestComponent {}
