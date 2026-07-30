import type { NextRequest } from 'next/server';
import { NextResponse }     from 'next/server';
import { headers }          from 'next/headers';

import { auth }             from '@/lib/auth';
import type { IStudentCurriculumResponse } from '@/types/siira';

export async function GET( req : NextRequest ): Promise<NextResponse> {
    const { searchParams } = new URL( req.url );
    const subjectId        = searchParams.get( 'subjectId' );

    if ( !subjectId ) {
        return NextResponse.json( { error: 'Falta el parámetro subjectId' }, { status: 400 } );
    }

    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        const email = session?.user?.email ?? 'jane.doe@example.com';

        // Query backend NestJS service
        const backendRes = await fetch( `http://localhost:5050/study-plan/student-email/${ encodeURIComponent( email ) }?activePeriod=true` );

        if ( !backendRes.ok ) {
            return NextResponse.json( { error: 'Error fetching study plan from backend' }, { status: backendRes.status } );
        }

        const data = await backendRes.json() as IStudentCurriculumResponse;

        // Find subject in semesters
        let subject = null;
        for ( const sem of data.semesters ) {
            const found = sem.subjects.find( ( s ) => s.id === subjectId );
            if ( found ) {
                subject = found;
                break;
            }
        }

        if ( !subject ) {
            return NextResponse.json( { error: 'Asignatura no encontrada' }, { status: 404 } );
        }

        const mappedSections = subject.sections.map( ( sec ) => ({
            id     : sec.id,
            quotas : Math.max( 0, sec.quota - ( sec.registered ?? 0 ) ),
        }) );

        const quotas = mappedSections.reduce( ( acc, sec ) => acc + sec.quotas, 0 );

        return NextResponse.json({
            subjectId : subject.id,
            quotas    : quotas,
            sections  : mappedSections.length > 0 ? mappedSections : [
                { id: `${ subject.id }-sec-1`, quotas: quotas }
            ],
        });
    } catch ( error ) {
        console.error( 'Error in polling quotas:', error );
        return NextResponse.json( { error: 'Internal Server Error' }, { status: 500 } );
    }
}
