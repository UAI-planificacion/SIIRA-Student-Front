'use client';

import { useQuery }      from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { Draft } from '@/types/siira';

async function fetchDraft(): Promise<Draft> {
    const res = await fetch( '/api/draft/get-one' );

    if ( !res.ok ) throw new Error( 'Error al cargar el borrador' );

    return res.json() as Promise<Draft>;
}

export function useDraft(): UseQueryResult<Draft, Error> {
    return useQuery<Draft, Error>({
        queryKey  : [ 'draft' ],
        queryFn   : fetchDraft,
        staleTime : 0,
    });
}
