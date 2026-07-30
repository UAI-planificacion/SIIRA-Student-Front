export type Day = "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado";


export interface ScheduleSlot {
    day   : Day;
    block : number; // Del 1 al 8 — Bloques institucionales UAI
}


export type SubjectAcademicStatus = "approved" | "failed_or_pending" | "available_to_enroll";


// ─── Backend Interfaces (consuming-study-plan.md) ──────────────────────────────────
export type SubjectStatus = "APPROVED" | "FAILED" | "IN_PROGRESS" | "CREDITED";


export interface IModule {
	id        : number;
	code      : string;
	startHour : string;
	endHour   : string;
}


export interface IProfessor {
	id    : string;
	name  : string;
	email : string | null;
}


export interface ISession {
	id              : string;
	name            : string; // C | A | T | L (Cátedra, Ayudantía, Taller, Laboratorio)
	chairsAvailable : number | null;
	isEnglish       : boolean;
	date            : Date;
	professor       : IProfessor | null;
	module          : IModule;
	quota           : number;
	registered?     : number | null;
}


export interface ISection {
	id         : string;
	code       : number;
	isClosed   : boolean;
	groupId    : string;
	startDate  : Date;
	endDate    : Date;
	spaceType  : string | null;
	registered : number | null;
	building   : string | null;
	quota      : number;
	periodId   : string;
	sessions   : ISession[];
}


export interface IAcademicHistory {
	status     : SubjectStatus;
	finalGrade : number | null;
}


export interface ISubject {
	id              : string;
	name            : string;
	isActive        : boolean;
	spaceType       : string | null;
	credits         : number;
	description     : string | null;
	isRequired      : boolean;
	prerequisites   : string[];
	sections        : ISection[];
	academicHistory : IAcademicHistory | null;
}


export interface ISemesterGroup {
	semesterNumber : number;
	subjects       : ISubject[];
}


export interface IStudentCurriculumResponse {
	studentId   : string;
	studentName : string;
	email       : string;
	careerId    : string;
	careerName  : string;
	semesters   : ISemesterGroup[];
}


export interface SubjectSection {
    id          : string;
    label       : string;   // "Sec 1", "Sec 2", …
    professor   : string;
    schedule    : string;   // JSON.stringify(ScheduleSlot[])
    quotas      : number;   // Cupos disponibles actuales
    capacity    : number;   // Capacidad total (para mostrar ratio visual)
    ssec        : string;   // "IDSubject-CodeSection" (ej. INF-101-1)
    sessionName : string;   // "Cátedra" | "Taller" | "Ayudantía" | "Laboratorio"
    building    : string | null;
    spaceType   : string | null;
    isEnglish   : boolean;
    profEmail   : string | null;
    day         : Day;
    timeLabel   : string;
}

// ─── Subject ──────────────────────────────────────────────────────────────────
export interface Subject {
    id              : string;
    name            : string;
    credits         : number;
    quotas          : number;   // Cupos actuales — mutable por polling
    // kind            : SubjectKind;
    professor       : string;
    schedule        : string;   // JSON.stringify(ScheduleSlot[])
    description     : string | null;
    isRequired      : boolean;
    academicStatus  : SubjectAcademicStatus; // Estado académico del estudiante en este ramo
    semester        : number;                // Columna de semestre en la malla (1, 2, 3...)
    prerequisites?  : string[];              // IDs de asignaturas prerrequisito (directas)
    sections?       : SubjectSection[];      // Secciones disponibles (solo en available_to_enroll)

    // Nuevos campos reales
    isActive        : boolean;
    spaceType       : string | null;
    academicHistory : IAcademicHistory | null;
    rawSections     : ISection[];
}


export type DraftStatus = "editing" | "submitted";


export interface Draft {
    id               : string;
    subjects         : Subject[];
    remainingCredits : number;
    status           : DraftStatus;
}


export interface StudyPlan {
    status : 'freeze' | 'pending';
    data   : any;
}


export interface ExecutionMode {
    startDateEjecution : Date;
    endDateEjecution   : Date;
    studentStartDate   : Date;
    studyPlan          : StudyPlan;
}


export interface Student {
    id            : string;
    name          : string;
    program       : string;
    totalCredits  : number;
    executionMode : ExecutionMode;
}


export interface StudentDraftResponse {
    draft   : Draft;
    student : Student;
}
