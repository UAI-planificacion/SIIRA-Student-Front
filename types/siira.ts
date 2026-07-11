export type Day = "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado";

export interface ScheduleSlot {
    day   : Day;
    block : number; // Del 1 al 8 — Bloques institucionales UAI
}

export type SubjectKind = "asignatura" | "taller";

export interface Subject {
    id          : string;
    name        : string;
    credits     : number;
    quotas      : number;   // Cupos actuales — mutable por polling
    kind        : SubjectKind;
    professor   : string;
    schedule    : string;   // JSON.stringify(ScheduleSlot[])
    description : string;
    isRequired  : boolean;
}

export type DraftStatus = "editing" | "submitted";

export interface Draft {
    id               : string;
    subjects         : Subject[];
    remainingCredits : number;
    status           : DraftStatus;
}

export interface Student {
    id           : string;
    name         : string;
    program      : string;
    totalCredits : number;
}

export interface StudentDraftResponse {
    draft   : Draft;
    student : Student;
}
