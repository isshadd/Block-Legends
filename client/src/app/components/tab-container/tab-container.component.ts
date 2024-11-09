import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ClavardageComponent } from '@app/components/clavardage/clavardage.component';
import { EventJournalComponent } from '@app/components/event-journal/event-journal.component'; // Use absolute import

@Component({
    selector: 'app-tab-container',
    standalone: true,
    imports: [ClavardageComponent, CommonModule, EventJournalComponent],
    templateUrl: './tab-container.component.html',
    styleUrls: ['./tab-container.component.scss'],
})
export class TabContainerComponent {
    activeTab: string = 'chat';
}
