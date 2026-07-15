'use client';

import { useQuery }      from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { Subject } from '@/types/siira';

async function fetchSubjects(): Promise<Subject[]> {
    const res = await fetch( '/api/signatures/get-all' );

    if ( !res.ok ) throw new Error( 'Error al cargar las asignaturas' );

    return res.json() as Promise<Subject[]>;
}

export function useSubjects(): UseQueryResult<Subject[], Error> {
    return useQuery<Subject[], Error>({
        queryKey : [ 'subjects' ],
        queryFn  : fetchSubjects,
    });
}
