'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Subject } from '@/types/siira';

export interface SubjectQuotasData {
	subjectId	: string;
	quotas		: number;
	sections	: {
		id		: string;
		quotas	: number;
		status	?: 'ok' | 'error' | 'timeout';
	}[];
}

async function fetchSubjectQuotas( subject : Subject ): Promise<SubjectQuotasData> {
	// Build the sessions parameter: comma-separated list of "virtualId:sessionId"
	const sessionsParam = subject.sections?.map( ( sec ) => {
		const parts = sec.id.split( '_' );
		const sessionId = parts[ 1 ] ?? parts[ 0 ];
		return `${ sec.id }:${ sessionId }`;
	} ).join( ',' ) ?? '';

	const res = await fetch( `/api/polling/quotas?subjectId=${ encodeURIComponent( subject.id ) }&sessions=${ encodeURIComponent( sessionsParam ) }` );

	if ( !res.ok ) throw new Error( 'Error al cargar los cupos de la asignatura' );

	return res.json() as Promise<SubjectQuotasData>;
}

export function useSubjectQuotas(
	subject		: Subject,
	enabled		: boolean = true,
): UseQueryResult<SubjectQuotasData, Error> {
	return useQuery<SubjectQuotasData, Error>( {
		queryKey		: [ 'quotas', subject.id ],
		queryFn			: () => fetchSubjectQuotas( subject ),
		refetchInterval	: ( query ) => {
			const data = query.state.data;

			if ( data && ( data.quotas === 0 || data.sections.every( ( s ) => s.quotas === 0 ) ) ) {
				return false;
			}

			return 3000;
		},
		enabled,
		staleTime		: 0,
	} );
}
