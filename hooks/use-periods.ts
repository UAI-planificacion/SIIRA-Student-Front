'use client';

import { useQuery }            from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { Period } from '@/types/periods';


async function fetchPeriods(): Promise<Period[]> {
    const res = await fetch( '/api/period/get-all' );

    if ( !res.ok ) throw new Error( 'Error al cargar los periodos' );

    return res.json() as Promise<Period[]>;
}


export function usePeriods(): UseQueryResult<Period[], Error> {
    return useQuery<Period[], Error>({
        queryKey : [ 'periods' ],
        queryFn  : fetchPeriods,
    });
}
