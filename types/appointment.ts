export interface Appointment {
    id: string;
    propertyName: string;
    city: string;
    price: number;
    date: string;
    time: string;
    lat: number | undefined;
    lng: number | undefined;
    status?: 'confirmed' | 'pending' | 'cancelled'; // optional if you have status
    type?: string; // optional if you have appointment type
    customerName?: string; // optional if you have customer info
    customerPhone?: string; // optional if you have customer info
    notes?: string; // optional for additional notes
    createdAt?: string; // optional timestamp
    updatedAt?: string; // optional timestamp
}

// If you want to be more specific with status
export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';

// If you want to create a more detailed version
export interface AppointmentDetails extends Appointment {
    propertyImages?: string[];
    propertyAddress?: string;
    propertyType?: 'apartment' | 'villa' | 'office' | 'shop';
    agentName?: string;
    agentPhone?: string;
    duration?: number; // appointment duration in minutes
}

// For API responses with pagination
export interface AppointmentResponse {
    data: Appointment[];
    total: number;
    page: number;
    limit: number;
}

// For creating a new appointment
export interface CreateAppointmentInput {
    propertyName: string;
    city: string;
    price: number;
    date: string;
    time: string;
    lat: number;
    lng: number;
    status?: AppointmentStatus;
    type?: string;
    notes?: string;
}

// For updating an appointment
export interface UpdateAppointmentInput extends Partial<CreateAppointmentInput> {
    id: string;
}