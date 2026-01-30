export enum UserRole {
    ADMIN = 'admin',
    OWNER = 'owner',
    COACH = 'coach',
    PARENT = 'parent',
    PLAYER = 'player',
}

export interface User {
    _id: string;
    email: string;
    fullName: string;
    role: UserRole;
    academies: string[];
}
