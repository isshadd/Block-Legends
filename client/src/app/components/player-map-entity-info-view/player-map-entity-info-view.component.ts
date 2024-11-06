import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-player-map-entity-info-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './player-map-entity-info-view.component.html',
    styleUrl: './player-map-entity-info-view.component.scss',
})
export class PlayerMapEntityInfoViewComponent implements OnInit {
    @Input() playerCharacter: PlayerCharacter;
    @Output() closeP = new EventEmitter<void>();
    @Input() scale: number = 1; // Scale par défaut de 1 (taille normale)
    @Input() showButton: boolean = true;

    constructor(
        public el: ElementRef,
        private renderer: Renderer2,
    ) {}

    get healthArray() {
        return new Array(this.playerCharacter.attributes.life);
    }

    get defenseArray() {
        return new Array(this.playerCharacter.attributes.defense);
    }

    get speedArray() {
        return new Array(this.playerCharacter.attributes.speed);
    }

    get attackArray() {
        return new Array(this.playerCharacter.attributes.attack);
    }

    ngOnInit(): void {
        this.renderer.setStyle(this.el.nativeElement, '--dynamic-scale', this.scale.toString());
    }

    closePanel() {
        this.closeP.emit();
    }
}
