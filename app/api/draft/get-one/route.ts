import type { NextRequest } from 'next/server';
import { NextResponse }     from 'next/server';

import type { Draft } from '@/types/siira';

const MOCK_DRAFT: Draft = {
    id               : "draft-001",
    subjects         : [],
    remainingCredits : 30,
    status           : "editing",
};

export async function GET( _req: NextRequest ): Promise<NextResponse> {
    await new Promise<void>( ( resolve ) => setTimeout( resolve, 2000 ) );

    return NextResponse.json( MOCK_DRAFT );
}
