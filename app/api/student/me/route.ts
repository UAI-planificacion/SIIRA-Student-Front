import type { NextRequest } from 'next/server';
import { NextResponse }     from 'next/server';

import type { Student } from '@/types/siira';



const MOCK_STUDENT: Student = {
    id           : "student-001",
    name         : "Kevin Candia",
    program      : "Ingeniería Civil Informática",
    totalCredits : 32,

    executionMode : {
        startDateEjecution : new Date( "2025-03-01" ),
        endDateEjecution   : new Date( "2027-12-31" ),
        studentStartDate   : new Date( "2025-03-01" ),
        studyPlan : {
            status : 'freeze',
            data : {
                
            }
        },
    },
};


export async function GET( _req: NextRequest ): Promise<NextResponse> {
    await new Promise<void>( ( resolve ) => setTimeout( resolve, 2000 ) );

    return NextResponse.json( MOCK_STUDENT );
}
