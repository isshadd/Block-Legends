import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChatComponent } from '@app/components/chat/chat.component';
import { EventJournalComponent } from '@app/components/event-journal/event-journal.component';

@Component({
    selector: 'app-tab-container',
    standalone: true,
    imports: [ChatComponent, CommonModule, EventJournalComponent],
    templateUrl: './tab-container.component.html',
    styleUrls: ['./tab-container.component.scss'],
})
export class TabContainerComponent {
    activeTab: string = 'chat';
}
