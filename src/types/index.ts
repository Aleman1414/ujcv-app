export type Role = 'admin' | 'docente' | 'alumno';

export interface User {
    uid: string;
    name: string;
    email: string;
    role: Role;
    createdAt: number;
}

export type ClassroomStatus = 'disponible' | 'ocupada';
export type ClassroomType = 'aula' | 'laboratorio';

export interface Classroom {
    id: string; // Document ID and logical ID
    name: string; // e.g., "Módulo A1" or "Lab 1"
    type: ClassroomType;
    module: string; // "A", "B", "C", "D", "E", or "Labs"
    status: ClassroomStatus;
    currentTeacher?: string | null;
    currentSchedule?: string | null;
}

export interface Teacher {
    id: string;
    name: string;
    email: string;
    assignedClasses: string[]; // Class IDs
}

export interface ClassSession {
    id: string;
    name: string; // e.g., "Matemáticas I"
    teacherId: string;
    classroomId: string; // Maps to Classroom
    startTime: string; // "07:00"
    endTime: string; // "08:30"
    days: number[]; // 0-6 or 1-7 (e.g. [1, 3] for Mon, Wed) -> Assuming 1=Mon, 2=Tue, etc.
}
