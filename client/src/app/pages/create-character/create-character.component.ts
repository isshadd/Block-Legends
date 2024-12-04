import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttributesComponent } from '@app/components/create-character/attributes/attributes.component';
import { AvatarSelectionComponent } from '@app/components/create-character/avatar-selection/avatar-selection.component';
import { ImageShowcaseComponent } from '@app/components/image-showcase/image-showcase.component';
import { ModalComponent } from '@app/components/modal/modal.component';
import { GameService } from '@app/services/game-services/game.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-create-character',
    standalone: true,
    imports: [FormsModule, CommonModule, AttributesComponent, AvatarSelectionComponent, ModalComponent, ImageShowcaseComponent],
    templateUrl: './create-character.component.html',
    styleUrl: './create-character.component.scss',
})
export class CreateCharacterComponent implements OnInit, OnDestroy {
    character = new PlayerCharacter('');
    gameId: string | null;

    isModalOpen = false;

    characterStatus: string | null;
    private subscriptions: Subscription = new Subscription();
    constructor(
        private router: Router,
        private gameService: GameService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.subscriptions.add(
            this.route.queryParamMap.subscribe((params) => {
                this.gameId = params.get('id');
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    createCharacter() {
        const missingFields: string[] = [];
        const fieldsToCheck = [
            { field: this.character.name, label: 'Nom' },
            { field: this.character.avatar?.name, label: 'Avatar' },
            { field: this.character.isAttackBonusAssigned, label: "Bonus d'attaque" },
            { field: this.character.isDefenseBonusAssigned, label: 'Bonus de défense' },
            { field: this.character.isLifeBonusAssigned, label: 'Bonus de vie' },
            { field: this.character.isSpeedBonusAssigned, label: 'Bonus de vitesse' },
        ];

        fieldsToCheck.forEach((item) => {
            const { field, label } = item;

            if (
                field === undefined ||
                field === null ||
                (typeof field === 'string' && field.trim() === '') ||
                (typeof field === 'boolean' && field === false)
            ) {
                missingFields.push(label);
            }
        });
        if (missingFields.length > 0) {
            this.characterStatus = `Le formulaire de création de personnage n'est pas valide ! Manquants: ${missingFields.join(', ')}.`;
        } else {
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
