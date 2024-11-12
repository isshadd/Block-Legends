import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService } from '@app/services/game-services/game.service';
import { AvatarSelectionComponent } from '../create-character/avatar-selection/avatar-selection.component';
import { CharacterFormComponent } from '../create-character/character-form/character-form.component';
import { AttributesComponent } from "../create-character/attributes/attributes.component";

@Component({
    selector: 'app-character-creation',
    standalone: true,
    imports: [CharacterFormComponent, AvatarSelectionComponent, AttributesComponent],
    templateUrl: './character-creation.component.html',
    styleUrl: './character-creation.component.scss',
})
export class CharacterCreationComponent {
    character = new PlayerCharacter('');
    gameId: string | null;

    isModalOpen = false;

    characterStatus: string | null;

    constructor(
        private router: Router,
        private gameService: GameService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            this.gameId = params.get('id');
        });
    }

    createCharacter() {
        const missingFields: string[] = [];
        const fieldsToCheck = [
            { field: this.character.name, label: 'Nom' },
            { field: this.character.avatar, label: 'Avatar' },
            { field: this.character.isAttackBonusAssigned, label: "Bonus d'attaque" },
            { field: this.character.isDefenseBonusAssigned, label: 'Bonus de défense' },
            { field: this.character.isLifeBonusAssigned, label: 'Bonus de vie' },
            { field: this.character.isSpeedBonusAssigned, label: 'Bonus de vitesse' },
        ];

        fieldsToCheck.forEach((item) => {
            switch (item.field) {
                case '':
                case false:
                    missingFields.push(item.label);
                    break;
                default:
                    break;
            }
        });
        if (missingFields.length > 0) {
            this.characterStatus = `Le formulaire de création de personnage n'est pas valide ! Manquants: ${missingFields.join(', ')}.`;
        } else if (!this.character.isNameValid) {
            this.characterStatus = 'Le nom du personnage est invalide !';
        } else {
            // this.character.name += ' ♔';
            this.character.setOrganizer();
            this.gameService.setCharacter(this.character);
            this.router.navigate(['/waiting-view'], { queryParams: { roomId: this.gameId } });
        }
    }
    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    confirmBack() {
        this.closeModal();
        this.router.navigate(['/create-game']);
    }
}
