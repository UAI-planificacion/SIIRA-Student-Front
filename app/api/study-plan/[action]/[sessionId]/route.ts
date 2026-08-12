import { NextResponse } from 'next/server';
import { ENV }          from '@/config/envs/env';


export async function POST(
	_req: Request,
	{ params }: { params: Promise<{ action: string; sessionId: string }> }
): Promise<NextResponse> {
	const { action, sessionId } = await params;

	if ( action !== 'subscribe' && action !== 'unsubscribe' ) {
		return NextResponse.json({ error : 'Acción no permitida' }, { status : 400 });
	}

	const { searchParams } = new URL( _req.url );
	const email            = searchParams.get( 'email' );

	if ( !email ) {
		return NextResponse.json({ error : 'El correo electrónico es requerido' }, { status : 400 });
	}

	try {
		const response = await fetch( `${ ENV.REQUEST_BACK_URL }/study-plan/${ action }/${ sessionId }/${ encodeURIComponent( email ) }`, {
			method  : 'POST',
			headers : {
				'Content-Type' : 'application/json',
			},
		} );

		if ( !response.ok ) {
			const errorData = await response.json().catch( () => ({}) );
			return NextResponse.json(
				errorData,
				{ status : response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json( data, { status : 202 } );
	} catch ( error: any ) {
		return NextResponse.json(
			{ error : error?.message || 'Internal Server Error' },
			{ status : 500 }
		);
	}
}
