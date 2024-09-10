import { Component } from '@angular/core';

@Component({
    selector: 'app-map-editor',
    standalone: true,
    imports: [],
    templateUrl: './map-editor.component.html',
    styleUrl: './map-editor.component.scss',
})
export class MapEditorComponent {
    grid = [
        [{ type: 'stone' }, { type: 'water' }, { type: 'grass' }, { type: 'stone' }, { type: 'water' }],
        [{ type: 'grass' }, { type: 'stone' }, { type: 'water' }, { type: 'grass' }, { type: 'stone' }],
        [{ type: 'water' }, { type: 'grass' }, { type: 'stone' }, { type: 'water' }, { type: 'grass' }],
        [{ type: 'stone' }, { type: 'water' }, { type: 'grass' }, { type: 'stone' }, { type: 'water' }],
        [{ type: 'grass' }, { type: 'stone' }, { type: 'water' }, { type: 'grass' }, { type: 'stone' }],
    ];

    onTileClick(i: number, j: number) {
        alert(`Tile ${j}, ${i} clicked`);
    }
}
