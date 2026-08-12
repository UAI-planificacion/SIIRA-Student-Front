import type { NextRequest } from 'next/server';
import { NextResponse }     from 'next/server';
import { headers }          from 'next/headers';

import type {
    Subject,
    SubjectSection,
    Day,
    IStudentCurriculumResponse,
    ISubject,
    ISemesterGroup,
    ISection,
    ISession,
}               from '@/types/siira';
import { auth } from '@/lib/auth';
import { ENV }  from '@/config/envs/env';

// Helper mapping Day index to Day strings
const DAYS_MAP: Day[] = [
    'Sábado', // Sunday
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
];


function getDayOfWeek( dateStr: string | Date ): Day {
    const d        = new Date( dateStr );
    const dayIndex = d.getDay();

    return DAYS_MAP[ dayIndex ] ?? 'Lunes';
}


const translateSessionName = ( name: string ): string => ({
    'C': 'Cátedra',
    'T': 'Taller',
    'A': 'Ayudantía',
    'L': 'Laboratorio',
})[ name.toUpperCase() ] ?? 'Sin información';


export async function GET( _req: NextRequest ): Promise<NextResponse> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        const email = session?.user?.email;


        if ( !email ) {
            return NextResponse.json( { error: 'No se encontró una sesión activa' }, { status: 401 } );
        }

        const queryParams = new URLSearchParams({
            activePeriod: 'false',
		});

        // Query backend NestJS service
        const backendRes = await fetch( `${ENV.REQUEST_BACK_URL}/study-plan/student-email/${ encodeURIComponent( email ) }?${ queryParams.toString() }` );

        if ( !backendRes.ok ) {
            return NextResponse.json( { error: 'Error fetching study plan from backend' }, { status: backendRes.status } );
        }

        const data = await backendRes.json() as IStudentCurriculumResponse;

        // Build set of approved subject IDs to compute available_to_enroll status
        const approvedIds = new Set(
            data.semesters.flatMap( ( sem: ISemesterGroup ) =>
                sem.subjects
                    .filter( ( s: ISubject ) => s.academicHistory?.status === 'APPROVED' || s.academicHistory?.status === 'CREDITED' )
                    .map( ( s: ISubject ) => s.id )
            )
        );

        // Map grouped backend subjects to a flat list of Subject[]
        const subjects: Subject[] = data.semesters.flatMap( ( sem: ISemesterGroup ) =>
            sem.subjects.map( ( s: ISubject ) => {
                // Determine kind: taller if any session name is 'T', else asignatura
                // const hasTaller = s.sections.some( ( sec: ISection ) =>
                //     sec.sessions.some( ( sess: ISession ) => sess.name.toUpperCase() === 'T' )
                // );
                // const kind : 'asignatura' | 'taller' = hasTaller ? 'taller' : 'asignatura';

                // Determine professor for legacy compatibility (first section's first session prof)
                let professor = 'Sin profesor';

                if ( s.sections.length > 0 ) {
                    const sectionProfs = s.sections[ 0 ]!.sessions
                        .map( ( sess: ISession ) => sess.professor?.name )
                        .filter( ( name: string | undefined ): name is string => !!name );

                    if ( sectionProfs.length > 0 ) {
                        professor = Array.from( new Set( sectionProfs ) ).join( ', ' );
                    }
                }

                // Map sections to legacy SubjectSection[] where each session is a separate SubjectSection!
                const mappedSections: SubjectSection[] = [];

                s.sections.forEach( ( sec: ISection ) => {
                    sec.sessions.forEach( ( session: ISession ) => {
                        const dayStr          = getDayOfWeek( session.date );
                        const blockId         = session.module.id;
                        const sessionNameFull = translateSessionName( session.name );

                        const secSlots = [
                            {
                                day   : dayStr,
                                block : blockId,
                            },
                        ];

						mappedSections.push({
							id          : `${ sec.id }_${ session.id }`,
							label       : `Sec ${ sec.code } - ${ sessionNameFull }`,
							professor   : session.professor?.name ?? 'Sin profesor',
							schedule    : JSON.stringify( secSlots ),
							quotas      : Math.max( 0, sec.quota - ( sec.registered ?? 0 ) ),
							capacity    : sec.quota,

							// Virtual session details
							ssec        : `${ s.id }-${ sec.code }`,
							sessionName : sessionNameFull,
							building    : sec.building,
							spaceType   : sec.spaceType,
							spaceId     : session.spaceId,
							isEnglish   : session.isEnglish,
							profEmail   : session.professor?.email ?? null,
							day         : dayStr,
							timeLabel   : `${ session.module.startHour } - ${ session.module.endHour }`,
							enrollments : session.enrollments,
						});
                    });
                });

                // Determine legacy quotas (sum of all virtual sections' quotas)
                const quotas = mappedSections.reduce( ( acc: number, ms: SubjectSection ) => acc + ms.quotas, 0 );

                // First section schedule for subject-level compatibility
                const defaultSlots = mappedSections[ 0 ]
                    ? JSON.parse( mappedSections[ 0 ].schedule )
                    : [];

                const schedule = JSON.stringify( defaultSlots );

                // Determine legacy academicStatus
                let academicStatus: 'approved' | 'failed_or_pending' | 'available_to_enroll' = 'available_to_enroll';

                if ( s.academicHistory?.status === 'APPROVED' || s.academicHistory?.status === 'CREDITED' ) {
                    academicStatus = 'approved';
                } else if ( s.academicHistory?.status === 'IN_PROGRESS' ) {
                    academicStatus = 'failed_or_pending';
                } else {
                    // Check if prerequisites are met
                    const hasUnapprovedPrereq = s.prerequisites.some(( prereqId: string ) => !approvedIds.has( prereqId ) );

                    if ( hasUnapprovedPrereq ) {
                        academicStatus = 'failed_or_pending';
                    } else {
                        academicStatus = 'available_to_enroll';
                    }
                }

                return {
                    id              : s.id,
                    name            : s.name,
                    credits         : s.credits,
                    quotas          : quotas,
                    // kind            : kind,
                    professor       : professor,
                    schedule        : schedule,
                    description     : s.description,
                    isRequired      : s.isRequired,
                    academicStatus  : academicStatus,
                    semester        : sem.semesterNumber,
                    prerequisites   : s.prerequisites,
                    sections        : mappedSections,

                    // New fields
                    isActive        : s.isActive,
                    spaceType       : s.spaceType,
                    academicHistory : s.academicHistory,
                    rawSections     : s.sections,
                };
            })
        );

        return NextResponse.json( subjects );
    } catch ( error ) {
        console.error( 'Error in signatures get-all:', error );
        return NextResponse.json( { error: 'Internal Server Error' }, { status: 500 } );
    }
}
