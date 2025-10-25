import { UserRole } from '../types';

export interface MockUser {
    id: string;
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
}

export const mockUsers: MockUser[] = [
    {
        id: 'user-1',
        email: 'admin@demo.com',
        password: 'admin123',
        fullName: 'Admin User',
        role: UserRole.Admin,
    },
];