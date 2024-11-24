export interface Profile {
    comportement: string;
}

export const ProfileEnum = {
    agressive: { comportement: 'aggressive' },
    defensive: { comportement: 'defensive' },
} as const;
