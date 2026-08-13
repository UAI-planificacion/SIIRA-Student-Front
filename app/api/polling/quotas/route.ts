import type { NextRequest } from 'next/server';
import { NextResponse }     from 'next/server';
import { ENV }              from '@/config/envs/env';

export interface SessionQuotaResponse {
	sessionId	: string;
	quota		: number;
}

async function fetchWithTimeout( url : string, options : RequestInit, timeout : number ): Promise<Response> {
	const controller = new AbortController();
	const id = setTimeout( () => controller.abort(), timeout );

	try {
		const response = await fetch( url, {
			...options,
			signal: controller.signal,
		} );
		clearTimeout( id );
		return response;
	} catch ( err ) {
		clearTimeout( id );
		throw err;
	}
}

export async function GET( req : NextRequest ): Promise<NextResponse> {
	const { searchParams } = new URL( req.url );
	const subjectId        = searchParams.get( 'subjectId' );
	const sessionsParam    = searchParams.get( 'sessions' );

	if ( !subjectId ) {
		return NextResponse.json( { error: 'Falta el parámetro subjectId' }, { status: 400 } );
	}

	try {
		// If no sessions are passed, return empty sections list
		if ( !sessionsParam ) {
			return NextResponse.json( {
				subjectId	: subjectId,
				quotas		: 0,
				sections	: [],
			} );
		}

		// sessionsParam is a comma-separated list of "virtualId:sessionId"
		const sessionItems = sessionsParam.split( ',' ).filter( Boolean );

		const mappedSections = await Promise.all(
			sessionItems.map( async ( item ) => {
				const [ virtualId, sessionId ] = item.split( ':' );

				if ( !virtualId || !sessionId ) {
					return {
						id		: virtualId || '',
						quotas	: 0,
						status	: 'error' as const,
					};
				}

                const url = `${ ENV.POLLER_BACK_URL }/api/v1/sessions/${ sessionId }/quota`;
                console.log('🚀 ~ GET ~ url:', url)

				try {
					const response = await fetchWithTimeout(
						`${ ENV.POLLER_BACK_URL }/api/v1/sessions/${ sessionId }/quota`,
						{
							method  : 'GET',
							headers : {
								'accept': '*/*',
							},
						},
						1000
					);

					if ( response.ok ) {
						const quotaData = await response.json() as SessionQuotaResponse;
						return {
							id		: virtualId,
							quotas	: quotaData.quota,
							status	: 'ok' as const,
						};
					} else {
						return {
							id		: virtualId,
							quotas	: 0,
							status	: 'error' as const,
						};
					}
				} catch ( error: any ) {
					console.error( `Error fetching real-time quota for session ${ sessionId }:`, error );
					if ( error.name === 'AbortError' ) {
						return {
							id		: virtualId,
							quotas	: 0,
							status	: 'timeout' as const,
						};
					}
					return {
						id		: virtualId,
						quotas	: 0,
						status	: 'error' as const,
					};
				}
			} )
		);

		const quotas = mappedSections.reduce( ( acc, sec ) => acc + sec.quotas, 0 );

		return NextResponse.json( {
			subjectId	: subjectId,
			quotas		: quotas,
			sections	: mappedSections,
		} );
	} catch ( error ) {
		console.error( 'Error in polling quotas proxy:', error );
		return NextResponse.json( { error: 'Internal Server Error' }, { status: 500 } );
	}
}
