'use client';

import { useQuery }      from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { Student } from '@/types/siira';

async function fetchStudent(): Promise<Student> {
    const res = await fetch( '/api/student/me' );

    if ( !res.ok ) throw new Error( 'Error al cargar el estudiante' );

    return res.json() as Promise<Student>;
}

export function useStudent(): UseQueryResult<Student, Error> {
    return useQuery<Student, Error>({
        queryKey  : [ 'student' ],
        queryFn   : fetchStudent,
        staleTime : 10 * 60 * 1000, // 10 minutos — no cambia en sesión
    });
}
