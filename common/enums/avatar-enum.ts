export interface Avatar {
    name: string;
    headImage: string;
    fullImage: string;
    mineshaftImage: string;
}

export const AvatarEnum = {
    Steve: {
        name: 'Steve',
        headImage: 'assets/images/avatar/Steve_head.png',
        fullImage: 'assets/images/avatar/Steve.png',
        mineshaftImage: 'assets/images/Skins/STeve/steve_mineshaft.jpg',
    },
    Arlina: {
        name: 'Arlina',
        headImage: 'assets/images/avatar/GirlSkin1_head.png',
        fullImage: 'assets/images/avatar/GirlSkin1.png',
        mineshaftImage: 'assets/images/Skins/Arlina/alrina_mineshaft.png',
    },
    Alex: {
        name: 'Alex',
        headImage: 'assets/images/avatar/Alex_head.png',
        fullImage: 'assets/images/avatar/Alex.png',
        mineshaftImage: 'assets/images/Skins/Alex/alex_mineshaft.png',
    },
    King: {
        name: 'King',
        headImage: 'assets/images/avatar/King_head.png',
        fullImage: 'assets/images/avatar/King.png',
        mineshaftImage: 'assets/images/Skins/King/king_mineshaft.jpg',
    },
    Cosmic: {
        name: 'Cosmic',
        headImage: 'assets/images/avatar/Cosmic._head.png',
        fullImage: 'assets/images/avatar/Cosmic.png',
        mineshaftImage: 'assets/images/Skins/Cosmic/cosmic_mineshaft.png',
    },
    Sirene: {
        name: 'Sirene',
        headImage: 'assets/images/avatar/Sirene_head.png',
        fullImage: 'assets/images/avatar/Sirene.png',
        mineshaftImage: 'assets/images/Skins/Sirene/sirene_mineshaft.jpg',
    },
    Zombie: {
        name: 'Zombie',
        headImage: 'assets/images/avatar/zombie_head.png',
        fullImage: 'assets/images/avatar/zombie.png',
        mineshaftImage: 'assets/images/Skins/Zombie/zombie_mineshaft.jpg',
    },
    Mushroom: {
        name: 'Mushroom',
        headImage: 'assets/images/avatar/Muffin_head.png',
        fullImage: 'assets/images/avatar/Muffin.png',
        mineshaftImage: 'assets/images/Skins/Mushroom/mushroom_mineshaft.jpg',
    },
    Piglin: {
        name: 'Piglin',
        headImage: 'assets/images/avatar/Piglin_head.png',
        fullImage: 'assets/images/avatar/Piglin.png',
        mineshaftImage: 'assets/images/Skins/Pigman/pigman_mineshaft.jpg',
    },
    Strawberry: {
        name: 'Strawberry',
        headImage: 'assets/images/avatar/StrawberryShortcake_head.png',
        fullImage: 'assets/images/avatar/StrawberryShortcake.png',
        mineshaftImage: 'assets/images/Skins/StrawberryShortcake/strawberry_Shortcake_mineshaft.jpg',
    },
    Knight: {
        name: 'Knight',
        headImage: 'assets/images/avatar/Knight_head.png',
        fullImage: 'assets/images/avatar/Knight.png',
        mineshaftImage: 'assets/images/Skins/Knight/knight_mineshaft.jpg',
    },
    Finn: {
        name: 'Finn',
        headImage: 'assets/images/avatar/finn_head.png',
        fullImage: 'assets/images/avatar/finn.png',
        mineshaftImage: 'assets/images/Skins/Finn/finn_mineshaft.jpg',
    },
} as const;
