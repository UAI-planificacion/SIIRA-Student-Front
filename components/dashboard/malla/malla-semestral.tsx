'use client';

import { useMemo, useRef } from 'react';

import { AlertCircle } from 'lucide-react';

import { useSubjects }    from '@/hooks/use-subjects';
import type { Subject }   from '@/types/siira';
import { MallaSkeleton }  from './malla-skeleton';
import { SemesterColumn } from './semester-column';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupBySemester( subjects: Subject[] ): Map<number, Subject[]> {
    const map = new Map<number, Subject[]>();

    for ( const subject of subjects ) {
        const group = map.get( subject.semester ) ?? [];

        group.push( subject );
        map.set( subject.semester, group );
    }

    // Sort keys so columns appear in ascending semester order
    return new Map( [ ...map.entries() ].sort( ( a, b ) => a[ 0 ] - b[ 0 ] ) );
}

// ─── Legend ──────────────────────────────────────────────────────────────────

function StatusLegend(): React.JSX.Element {
    return (
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Estado:
            </span>

            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="size-2.5 rounded-sm bg-muted/60 border border-border" />
                Aprobado
            </span>

            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="size-2.5 rounded-sm bg-yellow-500/10 border border-yellow-500/40" />
                Pendiente / Reprobado
            </span>

            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="size-2.5 rounded-sm bg-card border border-primary/30" />
                Disponible para inscribir
            </span>
        </div>
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MallaSemestral(): React.JSX.Element {
    const { data: subjects, isLoading, isError } = useSubjects();

    // Ref to the horizontal scroll container — passed down so MallaNode can
    // attach a one-time 'scroll' listener that closes the Popover on scroll.
    const scrollRef = useRef<HTMLDivElement>( null );

    const grouped = useMemo(
        () => ( subjects ? groupBySemester( subjects ) : new Map<number, Subject[]>() ),
        [ subjects ]
    );

    // ── Loading ───────────────────────────────────────────────────────────────
    if ( isLoading ) {
        return (
            <div className="flex-1 overflow-hidden flex flex-col">
                <StatusLegend />
                <MallaSkeleton />
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if ( isError || !subjects ) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <AlertCircle className="size-5 text-destructive" />
                <p className="text-sm">Error al cargar la malla. Intente nuevamente.</p>
            </div>
        );
    }

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            <StatusLegend />

            {/* Horizontal scroll container */}
            <div
                ref={ scrollRef }
                className="flex-1 overflow-x-auto overflow-y-auto"
            >
                <div className="flex gap-4 p-4 min-w-max min-h-full items-start">
                    { [ ...grouped.entries() ].map( ( [ semester, semSubjects ] ) => (
                        <SemesterColumn
                            key={ semester }
                            semester={ semester }
                            subjects={ semSubjects }
                            scrollContainerRef={ scrollRef }
                        />
                    ) ) }
                </div>
            </div>
        </div>
    );
}
