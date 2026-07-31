import { NextResponse } from 'next/server';
import { ENV }          from '@/config/envs/env';
import { Period }       from '@/types/periods';


export async function GET(): Promise<NextResponse> {
    try {
        const response = await fetch( `${ENV.REQUEST_BACK_URL}/periods`, {
            method  : 'GET',
            headers : {
                'accept': '*/*',
            },
        } );

        if ( !response.ok ) {
            return NextResponse.json(
                { error: `Error fetching periods from backend: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data: Period[] = await response.json();
        return NextResponse.json( data, { status: 200 } );
    } catch ( error: any ) {
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
