import type { NextRequest } from 'next/server';
import { NextResponse }     from 'next/server';

import { initGlobalSubjects } from '../../signatures/get-all/route';

export async function GET( req : NextRequest ): Promise<NextResponse> {
    const { searchParams } = new URL( req.url );
    const subjectId        = searchParams.get( 'subjectId' );
    const reset            = searchParams.get( 'reset' ) === 'true';

    if ( reset ) {
        initGlobalSubjects( true );
        return NextResponse.json( { message: 'Contadores reiniciados con éxito' } );
    }

    if ( !subjectId ) {
        return NextResponse.json( { error: 'Falta el parámetro subjectId' }, { status: 400 } );
    }

    initGlobalSubjects();

    const subject = globalThis.siiraSubjects?.find( ( s ) => s.id === subjectId );

    if ( !subject ) {
        return NextResponse.json( { error: 'Asignatura no encontrada' }, { status: 404 } );
    }

    // Restar de forma aleatoria (0 o 1) cupos para simular inscripciones en vivo
    if ( subject.sections && subject.sections.length > 0 ) {
        subject.sections.forEach( ( sec ) => {
            if ( sec.quotas > 0 ) {
                const decrement = Math.random() < 0.5 ? 1 : 0;
                sec.quotas      = Math.max( 0, sec.quotas - decrement );
            }
        });

        subject.quotas = subject.sections.reduce( ( acc, s ) => acc + s.quotas, 0 );
    } else {
        if ( subject.quotas > 0 ) {
            const decrement = Math.random() < 0.5 ? 1 : 0;
            subject.quotas  = Math.max( 0, subject.quotas - decrement );
        }
    }

    return NextResponse.json({
        subjectId : subject.id,
        quotas    : subject.quotas,
        sections  : subject.sections?.map( ( sec ) => ({
            id     : sec.id,
            quotas : sec.quotas,
        }) ) ?? [
            { id: `${ subject.id }-sec-1`, quotas: subject.quotas }
        ],
    });
}
