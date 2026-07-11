import type { NextRequest } from 'next/server';
import { NextResponse }     from 'next/server';

import type { Student } from '@/types/siira';

const MOCK_STUDENT: Student = {
    id           : "student-001",
    name         : "Kevin Díaz",
    program      : "Ingeniería Civil Informática",
    totalCredits : 30,
};

export async function GET( _req: NextRequest ): Promise<NextResponse> {
    await new Promise<void>( ( resolve ) => setTimeout( resolve, 2000 ) );

    return NextResponse.json( MOCK_STUDENT );
}
