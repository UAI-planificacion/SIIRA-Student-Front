'use client';

import { useStudent } from './use-student';

export type SIIRAMode = 'planificacion' | 'toma_ramos' | 'finalizado' | 'esperando_prioridad';

export interface UseExecutionModeResult {
    mode             : SIIRAMode;
    studentStartDate : Date | null;
    isLoading        : boolean;
}

export function useExecutionMode(): UseExecutionModeResult {
    const { data: student, isLoading } = useStudent();

    if ( isLoading || !student || !student.executionMode ) {
        return {
            mode             : 'planificacion',
            studentStartDate : null,
            isLoading        : true,
        };
    }

    const { startDateEjecution, endDateEjecution, studentStartDate } = student.executionMode;

    const start    = startDateEjecution ? new Date( startDateEjecution )    : null;
    const end      = endDateEjecution   ? new Date( endDateEjecution )      : null;
    const priority = studentStartDate   ? new Date( studentStartDate )      : null;
    const now      = new Date();

    // 1. Proceso terminado
    if ( end && now >= end ) {
        return {
            mode             : 'finalizado',
            studentStartDate : priority,
            isLoading        : false,
        };
    }

    // 2. Modo Planificación (fecha actual anterior a startDateEjecution)
    if ( start && now < start ) {
        return {
            mode             : 'planificacion',
            studentStartDate : priority,
            isLoading        : false,
        };
    }

    // 3. Modo Toma de Ramos (fecha actual >= startDateEjecution y < endDateEjecution)
    //    Verificamos la prioridad individual del estudiante
    if ( priority && now < priority ) {
        return {
            mode             : 'esperando_prioridad',
            studentStartDate : priority,
            isLoading        : false,
        };
    }

    return {
        mode             : 'toma_ramos',
        studentStartDate : priority,
        isLoading        : false,
    };
}
