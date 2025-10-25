export enum TicketStatus {
    Active = 'Active',
    InProgress = 'In Progress',
    Used = 'Used',
}

export interface TicketHolder {
    userId: string;
    fullName: string;
    whatsAppNumber: string;
    studentId?: string;
    eventDetails: string;
    category: string;
    registrationTimestamp: string;
    status: TicketStatus;
}

export interface QrCodeData {
    userId: string;
    fullName: string;
    studentId?: string;
    eventDetails: string;
    registrationTimestamp: string;
    category: string;
}

export enum UserRole {
    Admin = 'Admin',
}

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
}

export interface EventSettings {
    eventName: string;
    eventDate: string;
    eventLocation: string;
}