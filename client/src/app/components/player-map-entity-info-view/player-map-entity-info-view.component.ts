import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
    @Input() actionPoints: number;
    @Input() totalLife: number;
    @Output() close = new EventEmitter<void>();
    @Output() closeP = new EventEmitter<void>();
    @Input() scale: number = 1; // Scale par défaut de 1 (taille normale)
    @Input() showButton: boolean = true;
    attackDice: string;
    defenseDice: string;

    constructor(
        public el: ElementRef,
    ) {}

    ngOnInit(): void {
        //this.renderer.setStyle(this.el.nativeElement, '--dynamic-scale', this.scale.toString());
        if (this.playerCharacter.dice === 'attack') {
            this.attackDice = '(D6)';
            this.defenseDice = '(D4)';
        } else {
            this.attackDice = '(D6)';
            this.defenseDice = '(D6)';
        }
    }

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

    closePanel() {
        this.closeP.emit();
    }
}
