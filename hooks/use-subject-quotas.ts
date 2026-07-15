'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

export interface SubjectQuotasData {
    subjectId : string;
    quotas    : number;
    sections  : { id: string; quotas: number }[];
}

async function fetchSubjectQuotas( subjectId : string ): Promise<SubjectQuotasData> {
    const res = await fetch( `/api/polling/quotas?subjectId=${ encodeURIComponent( subjectId ) }` );

    if ( !res.ok ) throw new Error( 'Error al cargar los cupos de la asignatura' );

    return res.json() as Promise<SubjectQuotasData>;
}

export function useSubjectQuotas(
    subjectId : string,
    enabled   : boolean = true,
): UseQueryResult<SubjectQuotasData, Error> {
    return useQuery<SubjectQuotasData, Error>({
        queryKey        : [ 'quotas', subjectId ],
        queryFn         : () => fetchSubjectQuotas( subjectId ),
        refetchInterval : ( query ) => {
            const data = query.state.data;

            if ( data && ( data.quotas === 0 || data.sections.every( ( s ) => s.quotas === 0 ) ) ) {
                return false;
            }

            return 3000;
        },
        enabled,
        staleTime       : 0,
    });
}
